import { PrismaClient, CaseType, CaseArea, CaseStatus, SemaphoreColor } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.legalCase.upsert({
    where: { radicado: "2024-0001" },
    update: {},
    create: {
      radicado: "2024-0001",
      clientName: "Juan Pérez",
      clientDoc: "10102020",
      clientDocType: "CC",
      clientPhone: "3001234567",
      clientEmail: "juan.perez@email.com",
      clientAddress: "Calle 100 #15-20",
      type: CaseType.Tutela,
      area: CaseArea.Familia,
      status: CaseStatus.Sustanciacion,
      semaphore: SemaphoreColor.yellow,
      deadline: "2024-06-30",
      createdAt: new Date().toISOString(),
      assignedStudent: "Mario Gonzalez",
      assignedProfessor: "Juan Perez",
      description: "Incumplimiento de cuota alimentaria",
      isMinor: true,
      highRiskAlert: false,
      procesalDeadlines: [], // JSON vacío por ahora
      aiTags: [],
      documents: [],
      auditLog: [],
      substitutionHistory: [],
      hoursSpent: 5.5,
      assignedStudentId: "clxxxxxx..." // El ID que sale de auth-service para mgonzalez
    }
  })
  console.log('✅ Caso legal de prueba creado exitosamente')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })