import { PrismaClient, UserRole } from '@prisma/client' // Importamos el enum directamente
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedDefaultPassword = await bcrypt.hash('password123', 10)

  console.log('Iniciando el sembrado de usuarios...')

  // 1. Crear Estudiante (Nota las minúsculas en UserRole)
  await prisma.user.upsert({
    where: { email: 'mgonzalez@universidad.edu.co' },
    update: {},
    create: {
      email: 'mgonzalez@universidad.edu.co',
      name: 'Mario Gonzalez',
      password: hashedDefaultPassword,
      role: UserRole.estudiante, // Usamos el enum del cliente
      activeCases: 2,
      semester: '8vo',
    },
  })

  // 2. Crear Profesor
  await prisma.user.upsert({
    where: { email: 'jperez@universidad.edu.co' },
    update: {},
    create: {
      email: 'jperez@universidad.edu.co',
      name: 'Juan Perez',
      password: hashedDefaultPassword,
      role: UserRole.profesor,
    },
  })

  // 3. Crear Administrativo
  await prisma.user.upsert({
    where: { email: 'sdiaz@universidad.edu.co' },
    update: {},
    create: {
      email: 'sdiaz@universidad.edu.co',
      name: 'Sandra Diaz',
      password: hashedDefaultPassword,
      role: UserRole.administrativo,
    },
  })

  console.log('✅ Base de datos poblada exitosamente.')
}

main()
  .catch((e) => {
    console.error('❌ Error al poblar la DB:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })