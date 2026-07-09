import { z } from 'zod'

// Valida las variables de entorno al arrancar. Si falta alguna requerida, se
// aborta con un mensaje claro en vez de fallar de forma confusa más adelante.
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerida (cadena de conexión de PostgreSQL)'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET es requerida y debe tener al menos 16 caracteres'),
  PORT: z.coerce.number().int().positive().default(3000),
  // Origen permitido para CORS. Si se omite, se aceptan todos (útil en desarrollo
  // o detrás de Nginx same-origin). En producción conviene fijar el dominio.
  CORS_ORIGIN: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:')
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = parsed.data
