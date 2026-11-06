import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import prisma from '../lib/prisma'
import { authMiddleware, requireRole, AuthRequest } from '../middlewares/auth'
import { env } from '../config/env'
import { logger } from '../lib/logger'

const router = Router()

// Limita intentos de login para frenar fuerza bruta (por IP).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
})

// POST /api/auth/register — protegido: solo un ADMINISTRADOR puede crear
// cuentas nuevas. No hay registro público. El comentario original decía
// "admin" pero el código solo exigía estar autenticado, sin importar el rol
// (ver PoC de escalación de privilegios, módulo Autenticación): cualquier
// cuenta —incluida una "cajero"— podía registrar otras cuentas y asignarles
// el rol que quisiera en el body, incluido 'admin'. requireRole('admin')
// cierra ese hueco; una vez cerrado, que esta misma ruta deje a un admin ya
// autenticado elegir el rol de la cuenta que crea (líneas de abajo) es una
// capacidad administrativa normal, no una vulnerabilidad.
router.post('/register', authMiddleware, requireRole('admin'), async (req: AuthRequest, res) => {
  const { nombre, email, password, rol } = req.body

  if (!nombre || !email || !password) {
    res.status(400).json({ error: 'nombre, email y password son requeridos' })
    return
  }

  if (rol !== undefined && rol !== 'admin' && rol !== 'cajero') {
    res.status(400).json({ error: "rol debe ser 'admin' o 'cajero'" })
    return
  }

  const existe = await prisma.usuarios.findUnique({ where: { email } })
  if (existe) {
    res.status(409).json({ error: 'El email ya está registrado' })
    return
  }

  const password_hash = await bcrypt.hash(password, 10)

  const usuario = await prisma.usuarios.create({
    // Sin rol explícito, la cuenta nace "cajero" (menor privilegio por defecto).
    data: { nombre, email, password_hash, rol: rol ?? 'cajero' },
    omit: { password_hash: true }
  })

  logger.info({ usuarioCreadoId: usuario.id, usuarioCreadoEmail: usuario.email, creadoPor: req.usuarioEmail }, 'Usuario registrado')
  res.status(201).json(usuario)
})

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'email y password son requeridos' })
    return
  }

  const usuario = await prisma.usuarios.findUnique({ where: { email } })
  if (!usuario) {
    logger.warn({ email }, 'Login fallido: email no registrado')
    res.status(401).json({ error: 'Credenciales incorrectas' })
    return
  }

  const passwordValida = await bcrypt.compare(password, usuario.password_hash)
  if (!passwordValida) {
    logger.warn({ email }, 'Login fallido: contraseña incorrecta')
    res.status(401).json({ error: 'Credenciales incorrectas' })
    return
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  // El token va en una cookie HttpOnly, no en el cuerpo de la respuesta (ver
  // PoC "JWT en localStorage"): así ningún script del navegador puede
  // leerlo, ni para guardarlo (como hacía antes AuthContext.tsx) ni para
  // robarlo vía XSS.
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8h, igual que expiresIn del JWT
  })

  logger.info({ usuarioId: usuario.id, email: usuario.email, rol: usuario.rol }, 'Login exitoso')
  res.json({ usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } })
})

// GET /api/auth/me — con la cookie ya no hay forma de que el frontend sepa
// quién es el usuario actual leyéndola directamente (es HttpOnly, por
// diseño). Este endpoint es cómo el frontend reconstruye la sesión al
// cargar la página: si la cookie es válida, devuelve los datos; si no, 401.
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: req.usuarioId! }, // authMiddleware ya garantizó que exista
    select: { id: true, nombre: true, email: true, rol: true },
  })
  if (!usuario) {
    res.status(401).json({ error: 'Token inválido o expirado' })
    return
  }
  res.json({ usuario })
})

// POST /api/auth/logout — antes "cerrar sesión" solo borraba localStorage
// del lado del navegador; el JWT seguía siendo válido en el servidor hasta
// su expiración natural (8h). Con la cookie, el backend sí puede invalidar
// la sesión de verdad.
router.post('/logout', (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
  res.status(204).send()
})

export default router
