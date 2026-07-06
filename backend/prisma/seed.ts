import 'dotenv/config'
import bcrypt from 'bcrypt'
import prisma from '../src/lib/prisma'

/**
 * Crea el primer usuario administrador a partir de las variables ADMIN_* del
 * .env. Se ejecuta una sola vez al instalar en un servidor nuevo:
 *   npm run seed
 * Es idempotente: si el usuario ya existe, no hace nada.
 */
async function main() {
  const nombre = process.env.ADMIN_NOMBRE ?? 'Administrador'
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('❌ Define ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env antes de correr el seed.')
    process.exit(1)
  }

  const existe = await prisma.usuarios.findUnique({ where: { email } })
  if (existe) {
    console.log(`ℹ️  El usuario ${email} ya existe. No se hace nada.`)
    return
  }

  const password_hash = await bcrypt.hash(password, 10)
  await prisma.usuarios.create({ data: { nombre, email, password_hash } })
  console.log(`✅ Administrador creado: ${email}`)
}

main()
  .catch((err) => {
    console.error('Error en el seed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
