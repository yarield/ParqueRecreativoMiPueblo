import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import categoriasRouter from './routes/categorias.routes'
import clientesRouter from './routes/clientes.routes'
import paquetesRouter from './routes/paquetes.routes'
import facturasRouter from './routes/facturas.routes'
import usuariosRouter from './routes/usuarios.routes'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/categorias', categoriasRouter)
app.use('/api/clientes', clientesRouter)
app.use('/api/paquetes', paquetesRouter)
app.use('/api/facturas', facturasRouter)
app.use('/api/usuarios', usuariosRouter)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
