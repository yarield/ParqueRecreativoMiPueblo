import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import prisma from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'
import { env } from '../config/env'

const router = Router()

// Limita intentos de login para frenar fuerza bruta (por IP).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
})

// POST /api/auth/register — protegido: solo un usuario autenticado (admin) puede
// crear cuentas nuevas. No hay registro público.
router.post('/register', authMiddleware, async (req, res) => {
  const { nombre, email, password } = req.body

  if (!nombre || !email || !password) {
    res.status(400).json({ error: 'nombre, email y password son requeridos' })
    return
  }

  const existe = await prisma.usuarios.findUnique({ where: { email } })
  if (existe) {
    res.status(409).json({ error: 'El email ya está registrado' })
    return
  }

  const password_hash = await bcrypt.hash(password, 10)

  const usuario = await prisma.usuarios.create({
    data: { nombre, email, password_hash },
    omit: { password_hash: true }
  })

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
    res.status(401).json({ error: 'Credenciales incorrectas' })
    return
  }

  const passwordValida = await bcrypt.compare(password, usuario.password_hash)
  if (!passwordValida) {
    res.status(401).json({ error: 'Credenciales incorrectas' })
    return
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } })
})

export default router
