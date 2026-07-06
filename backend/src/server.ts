import 'dotenv/config'
import { env } from './config/env'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import categoriasRouter from './routes/categorias.routes'
import clientesRouter from './routes/clientes.routes'
import paquetesRouter from './routes/paquetes.routes'
import facturasRouter from './routes/facturas.routes'
import usuariosRouter from './routes/usuarios.routes'
import authRouter from './routes/auth.routes'
import { errorHandler } from './middlewares/errorHandler'
import { iniciarTareaEstados } from './tasks/actualizarEstados'
import estadisticasRouter from './routes/estadisticas.routes'

const app = express()
const PORT = env.PORT

app.use(helmet())
// Si CORS_ORIGIN está definido, se restringe a ese origen; si no, se aceptan
// todos (desarrollo o detrás de Nginx same-origin).
app.use(cors({ origin: env.CORS_ORIGIN ?? true }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/categorias', categoriasRouter)
app.use('/api/clientes', clientesRouter)
app.use('/api/paquetes', paquetesRouter)
app.use('/api/facturas', facturasRouter)
app.use('/api/usuarios', usuariosRouter)
app.use('/api/estadisticas', estadisticasRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  iniciarTareaEstados()
})
