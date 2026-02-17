import { PrismaClient, UserRole, CaseType, CaseArea, CaseStatus, SemaphoreColor } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Términos procesales estándar por tipo de proceso (días hábiles)
const TERMINOS_PROCESALES: Record<string, { nombre: string; dias: number }[]> = {
  Tutela: [
    { nombre: 'Notificación al demandado', dias: 2 },
    { nombre: 'Admisorio o rechazo', dias: 10 },
    { nombre: 'Trámite al juez de conocimiento', dias: 2 },
    { nombre: 'Decisión de tutela', dias: 10 },
    { nombre: 'Notificación del fallo', dias: 1 },
    { nombre: 'Cumplimiento', dias: 48 },
  ],
  Demanda: [
    { nombre: 'Admisión de la demanda', dias: 30 },
    { nombre: 'Notificación al demandado', dias: 20 },
    { nombre: 'Contestación de demanda', dias: 30 },
    { nombre: 'Audiencia de conciliación', dias: 30 },
    { nombre: 'Alegatos de cierre', dias: 10 },
    { nombre: 'Sentencia de primera instancia', dias: 30 },
  ],
  Derecho_de_peticion: [
    { nombre: 'Respuesta a la petición', dias: 15 },
    { nombre: 'Silencio administrativo positivo', dias: 30 },
  ],
}

async function main() {
  const hashedDefaultPassword = await bcrypt.hash('password123', 10)

  console.log('🚀 Iniciando seed unificado para SICOP Sprint 1...')

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

    // 4. Crear caso legal con nuevos campos de Expediente
    const case1 = await prisma.legalCase.create({
      data: {
        radicado: 'SICOP-2024-001',
        numeroProceso: '11001310501420240012345',
        demandante: 'Ana María Rodríguez',
        demandado: 'EPS Sanitas',
        despacho: 'Juez Cuarto Civil Municipal de Bogotá',
        fechaNotificacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
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
        procesalDeadlines: [],
        substitutionHistory: [],
        interviewNotes: 'Cliente relata que lleva 3 meses esperando autorización para cirugía de columna.',
        aiTags: [{ tag: 'salud', confidence: 0.95 }, { tag: 'eps', confidence: 0.89 }],
        auditLog: [{ date: new Date().toISOString(), action: 'case_created', user: student.name }],
        hoursSpent: 12.5,
        assignedStudentId: student.id
      }
    })

    // 4.1 Crear términos procesales para case1 (Tutela)
    const terminosTutela = TERMINOS_PROCESALES['Tutela']
    let fechaActual = new Date()
    
    for (const termino of terminosTutela) {
      const fechaVencimiento = new Date(fechaActual)
      fechaVencimiento.setDate(fechaVencimiento.getDate() + termino.dias)
      
      const diasRestantes = Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      await prisma.legalDeadline.create({
        data: {
          legalCaseId: case1.id,
          tipoTermino: 'Tutela',
          nombreTermino: termino.nombre,
          fechaInicio: fechaActual,
          fechaVencimiento: fechaVencimiento,
          diasTermino: termino.dias,
          diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
          estado: diasRestantes > 0 ? 'activo' : 'vencido',
          observaciones: `Término automático calculado para tutela`,
        }
      })
      
      fechaActual = fechaVencimiento
    }

    // 4.2 Crear documentos para case1
    await prisma.document.create({
      data: {
        fileName: 'historia_clinica.pdf',
        fileType: 'application/pdf',
        fileSize: 1024000,
        legalCaseId: case1.id,
        uploadedBy: student.id,
        description: 'Historia clínica del paciente',
        status: 'active'
      }
    })

    // 5. Crear segundo caso
    const case2 = await prisma.legalCase.create({
      data: {
        radicado: 'SICOP-2024-002',
        numeroProceso: '11001310500520240054321',
        demandante: 'Carlos Alberto Martínez',
        demandado: 'Empresa ABC S.A.S.',
        despacho: 'Juez Primero Laboral de Bogotá',
        fechaNotificacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
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
        procesalDeadlines: [],
        substitutionHistory: [],
        interviewNotes: 'Trabajador con 5 años en la empresa, despido sin justa causa el mes pasado.',
        aiTags: [{ tag: 'despido', confidence: 0.92 }, { tag: 'prestaciones', confidence: 0.87 }],
        auditLog: [{ date: new Date().toISOString(), action: 'case_created', user: student.name }],
        hoursSpent: 6.0,
        assignedStudentId: student.id
      }
    })

    // 5.1 Crear términos procesales para case2 (Demanda Laboral)
    const terminosDemanda = TERMINOS_PROCESALES['Demanda']
    fechaActual = new Date()
    
    for (const termino of terminosDemanda) {
      const fechaVencimiento = new Date(fechaActual)
      fechaVencimiento.setDate(fechaVencimiento.getDate() + termino.dias)
      
      const diasRestantes = Math.ceil((fechaVencimiento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      await prisma.legalDeadline.create({
        data: {
          legalCaseId: case2.id,
          tipoTermino: 'Demanda Laboral',
          nombreTermino: termino.nombre,
          fechaInicio: fechaActual,
          fechaVencimiento: fechaVencimiento,
          diasTermino: termino.dias,
          diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
          estado: diasRestantes > 0 ? 'activo' : 'vencido',
          observaciones: `Término automático calculado para demanda laboral`,
        }
      })
      
      fechaActual = fechaVencimiento
    }

    // 5.2 Crear documentos para case2
    await prisma.document.create({
      data: {
        fileName: 'contrato_trabajo.pdf',
        fileType: 'application/pdf',
        fileSize: 512000,
        legalCaseId: case2.id,
        uploadedBy: student.id,
        description: 'Contrato de trabajo',
        status: 'active'
      }
    })

    // 6. Actualizar contador de casos activos del estudiante
    await prisma.user.update({
      where: { id: student.id },
      data: { activeCases: 2 }
    })

    console.log('✅ Seed Sprint 1 completado exitosamente:')
    console.log(`   👤 Usuarios: 3 (estudiante, profesor, administrativo)`)
    console.log(`   📁 Casos legales: 2 con términos procesales`)
    console.log(`   ⏱️  Términos procesales: ${terminosTutela.length + terminosDemanda.length} calculados automáticamente`)
    console.log(`   🔑 Contraseña por defecto: password123`)

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
