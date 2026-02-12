import { PrismaClient, UserRole, CaseType, CaseArea, CaseStatus, SemaphoreColor } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedDefaultPassword = await bcrypt.hash('password123', 10)

  console.log('🚀 Iniciando seed unificado para SICOP...')

  try {
    // 1. Crear Estudiante
    const student = await prisma.user.upsert({
      where: { email: 'mgonzalez@universidad.edu.co' },
      update: {},
      create: {
        email: 'mgonzalez@universidad.edu.co',
        name: 'Mario Gonzalez',
        password: hashedDefaultPassword,
        role: 'estudiante',
        activeCases: 0,
        semester: '8vo',
        area: 'Civil',
      },
    })

    // 2. Crear Profesor
    const professor = await prisma.user.upsert({
      where: { email: 'jperez@universidad.edu.co' },
      update: {},
      create: {
        email: 'jperez@universidad.edu.co',
        name: 'Juan Perez',
        password: hashedDefaultPassword,
        role: 'profesor',
        area: 'Laboral',
      },
    })

    // 3. Crear Administrativo
    const admin = await prisma.user.upsert({
      where: { email: 'sdiaz@universidad.edu.co' },
      update: {},
      create: {
        email: 'sdiaz@universidad.edu.co',
        name: 'Sandra Diaz',
        password: hashedDefaultPassword,
        role: 'administrativo',
      },
    })

    console.log('✅ Usuarios creados exitosamente.')

    // 4. Crear casos legales asignados a los usuarios reales
    const case1 = await prisma.legalCase.create({
      data: {
        radicado: 'SICOP-2024-001',
        clientName: 'Ana María Rodríguez',
        clientDoc: '801234567',
        clientDocType: 'Cédula',
        clientPhone: '3014567890',
        clientEmail: 'ana.rodriguez@email.com',
        clientAddress: 'Calle 45 #23-10, Bogotá',
        type: 'Tutela',
        area: 'Civil',
        status: 'Revision_del_profesor',
        semaphore: 'yellow',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignedStudentName: student.name,
        assignedProfessor: professor.name,
        description: 'Tutela por derecho a salud. Negación de procedimiento médico por EPS.',
        isMinor: false,
        highRiskAlert: false,
        procesalDeadlines: [
          { date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Presentar pruebas adicionales' },
          { date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Audiencia de conciliación' }
        ],
        substitutionHistory: [],
        interviewNotes: 'Cliente relata que lleva 3 meses esperando autorización para cirugía de columna.',
        aiTags: [{ tag: 'salud', confidence: 0.95 }, { tag: 'eps', confidence: 0.89 }],
        documents: [{ name: 'historia_clinica.pdf', uploadDate: new Date().toISOString(), type: 'medical_record' }],
        auditLog: [{ date: new Date().toISOString(), action: 'case_created', user: student.name }],
        hoursSpent: 12.5,
        assignedStudentId: student.id
      }
    })

    const case2 = await prisma.legalCase.create({
      data: {
        radicado: 'SICOP-2024-002',
        clientName: 'Carlos Alberto Martínez',
        clientDoc: '701234567',
        clientDocType: 'Cédula',
        clientPhone: '3109876543',
        clientEmail: 'carlos.martinez@email.com',
        clientAddress: 'Carrera 30 #15-20, Bogotá',
        type: 'Demanda',
        area: 'Laboral',
        status: 'Evaluacion',
        semaphore: 'green',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assignedStudentName: student.name,
        assignedProfessor: professor.name,
        description: 'Demanda por despido injustificado y pago de prestaciones sociales.',
        isMinor: false,
        highRiskAlert: false,
        procesalDeadlines: [
          { date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), description: 'Presentar demanda' },
          { date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), description: 'Notificación al demandado' }
        ],
        substitutionHistory: [],
        interviewNotes: 'Trabajador con 5 años en la empresa, despido sin justa causa el mes pasado.',
        aiTags: [{ tag: 'despido', confidence: 0.92 }, { tag: 'prestaciones', confidence: 0.87 }],
        documents: [{ name: 'contrato_trabajo.pdf', uploadDate: new Date().toISOString(), type: 'contract' }],
        auditLog: [{ date: new Date().toISOString(), action: 'case_created', user: student.name }],
        hoursSpent: 6.0,
        assignedStudentId: student.id
      }
    })

    // 5. Actualizar contador de casos activos del estudiante
    await prisma.user.update({
      where: { id: student.id },
      data: { activeCases: 2 }
    })

    console.log('✅ Seed unificado completado exitosamente:')
    console.log(`   👤 Usuarios creados: 3 (estudiante, profesor, administrativo)`)
    console.log(`   📁 Casos legales: 2 asignados a Mario Gonzalez`)
    console.log(`   🔑 Contraseña por defecto: password123`)
    console.log(`   🔗 IDs vinculados correctamente: student.id → legalCase.assignedStudentId`)

  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error crítico en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })