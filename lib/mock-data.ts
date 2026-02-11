// ── Types ────────────────────────────────────────────────────────────
export type CaseType = "Tutela" | "Demanda" | "Derecho de peticion" | "Consulta" | "Descargos" | "Alegatos precalificatorios" | "Alegato de conclusion" | "Nulidades" | "Recurso" | "Demanda de cumplimiento" | "Liquidacion" | "Seguridad Social" | "Pensiones" | "Conciliacion" | "Otros"
export type CaseArea = "Penal" | "Civil" | "Laboral" | "Familia" | "Derecho Publico" | "Derecho Disciplinario" | "Responsabilidad Fiscal" | "Constitucional" | "Comercial" | "Sucesiones" | "Conciliacion" | "Transito" | "Otros"

export type DocType = "C.C." | "T.I." | "C.E."

// RF-05: Flow states
export type CaseStatus =
  | "Evaluacion"
  | "Sustanciacion"
  | "Revision del profesor"
  | "Aprobado"
  | "Seguimiento"
  | "Cerrado"

export type SemaphoreColor = "red" | "yellow" | "green"

export type UserRole = "estudiante" | "profesor" | "administrativo"

// RF-17: Audit entry
export interface AuditEntry {
  id: string
  date: string
  time: string
  user: string
  role: UserRole | "IA"
  action: string
  detail?: string
}

// RF-07: Procesal deadline per action
export interface ProcesalDeadline {
  id: string
  name: string
  dueDate: string
  completed: boolean
}

// RF-27: Reserved legal data (sensitive)
export interface ReservedData {
  hasMinor: boolean
  hasGeneticData: boolean
  hasPensionData: boolean
  notes: string
}

// RF-03: Uploaded document
export interface CaseDocument {
  id: string
  name: string
  size: string
  type: "pdf" | "docx" | "image"
  uploadedBy: string
  uploadDate: string
  isApproved: boolean
  version: number
}

// RF-18: Satisfaction survey
export interface SatisfactionSurvey {
  caseId: string
  rating: "satisfecho" | "neutral" | "insatisfecho"
  comment?: string
  date: string
}

// RF-26: AI generated tags
export interface AITag {
  label: string
  confidence: number
}

export interface LegalCase {
  id: string
  radicado: string
  clientName: string
  clientDoc: string
  clientDocType: string
  clientPhone: string
  clientEmail: string
  clientAddress: string
  type: CaseType
  area: CaseArea
  status: CaseStatus
  semaphore: SemaphoreColor
  deadline: string
  createdAt: string
  assignedStudent: string
  assignedProfessor: string
  description: string
  isMinor: boolean
  highRiskAlert: boolean
  highRiskReason?: string
  procesalDeadlines: ProcesalDeadline[]
  reservedData?: ReservedData
  substitutionHistory: { from: string; to: string; date: string; reason: string }[]
  interviewNotes?: string
  aiTags: AITag[]
  documents: CaseDocument[]
  auditLog: AuditEntry[]
  survey?: SatisfactionSurvey
  hoursSpent: number
  hoursApproved: boolean
}

// ── TODAY constant (10 Feb 2026) ─────────────────────────────────────
export const TODAY = new Date(2026, 1, 10)

// ── Semaphore helper (relative to TODAY) ─────────────────────────────
export function getSemaphoreFromDeadline(deadline: string): SemaphoreColor {
  const dl = new Date(deadline)
  const diffDays = Math.ceil((dl.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return "red"       // 0 o menos = Vencido
  if (diffDays <= 3) return "yellow"     // 1 a 3 dias = Proximo a vencer
  return "green"                         // Mayor a 3 dias = En tiempo
}

export function getSemaphoreLabel(color: SemaphoreColor): string {
  switch (color) {
    case "red":
      return "Vencido"
    case "yellow":
      return "Proximo vencimiento"
    case "green":
      return "En tiempo"
  }
}

// ── Mock Cases ───────────────────────────────────────────────────────
export const mockCases: LegalCase[] = [
  {
    id: "1",
    radicado: "SICOP-2026-001234",
    clientName: "Juan Carlos Ramirez",
    clientDoc: "1023456789",
    clientDocType: "CC",
    clientPhone: "3101234567",
    clientEmail: "jramirez@correo.com",
    clientAddress: "Calle 45 #12-34, Bogota",
    type: "Tutela",
    area: "Laboral",
    status: "Revision del profesor",
    semaphore: "red",
    deadline: "2026-02-08",
    createdAt: "2026-01-15",
    assignedStudent: "Maria Gonzalez",
    assignedProfessor: "Dr. Perez",
    description:
      "Vulneracion de derechos laborales por despido injustificado sin pago de liquidacion correspondiente.",
    isMinor: false,
    highRiskAlert: false,
    procesalDeadlines: [
      { id: "d1", name: "Presentacion tutela", dueDate: "2026-02-08", completed: false },
      { id: "d2", name: "Audiencia inicial", dueDate: "2026-02-20", completed: false },
    ],
    reservedData: undefined,
    substitutionHistory: [],
    interviewNotes:
      "<p>El usuario indica que fue despedido el <strong>3 de enero de 2026</strong> sin justa causa.</p>",
    aiTags: [],
    documents: [
      { id: "doc1", name: "tutela_borrador_v2.docx", size: "245 KB", type: "docx", uploadedBy: "Maria Gonzalez", uploadDate: "2026-01-17", isApproved: false, version: 2 },
      { id: "doc2", name: "poder_notariado.pdf", size: "1.2 MB", type: "pdf", uploadedBy: "Maria Gonzalez", uploadDate: "2026-01-15", isApproved: true, version: 1 },
    ],
    auditLog: [
      { id: "a1", date: "15 Ene 2026", time: "10:30 AM", user: "Maria Gonzalez", role: "estudiante", action: "Creo el expediente digital", detail: "Tipo: Tutela | Area: Laboral" },
      { id: "a2", date: "15 Ene 2026", time: "10:32 AM", user: "Maria Gonzalez", role: "estudiante", action: "Subio documentos adjuntos", detail: "poder_notariado.pdf" },
      { id: "a4", date: "16 Ene 2026", time: "2:15 PM", user: "Dr. Perez", role: "profesor", action: "Devolvio con observaciones", detail: "Falta poder debidamente otorgado" },
      { id: "a5", date: "17 Ene 2026", time: "9:00 AM", user: "Maria Gonzalez", role: "estudiante", action: "Adjunto el poder notariado y reenvio a revision" },
      { id: "a6", date: "05 Feb 2026", time: "4:30 PM", user: "Dr. Perez", role: "profesor", action: "Cambio estado a Revision del profesor" },
    ],
    survey: undefined,
    hoursSpent: 12.5,
    hoursApproved: false,
  },
  {
    id: "2",
    radicado: "SICOP-2026-001235",
    clientName: "Ana Lucia Mendoza",
    clientDoc: "52345678",
    clientDocType: "CC",
    clientPhone: "3209876543",
    clientEmail: "amendoza@correo.com",
    clientAddress: "Carrera 7 #89-12, Bogota",
    type: "Derecho de peticion",
    area: "Civil",
    status: "Evaluacion",
    semaphore: "green",
    deadline: "2026-03-15",
    createdAt: "2026-02-01",
    assignedStudent: "Maria Gonzalez",
    assignedProfessor: "Dra. Rodriguez",
    description: "Solicitud de informacion sobre estado de tramite de escritura publica.",
    isMinor: false,
    highRiskAlert: false,
    procesalDeadlines: [
      { id: "d3", name: "Entrega de derecho de peticion", dueDate: "2026-03-15", completed: false },
    ],
    substitutionHistory: [],
    aiTags: [],
    documents: [
      { id: "doc5", name: "borrador_derecho_peticion.docx", size: "120 KB", type: "docx", uploadedBy: "Maria Gonzalez", uploadDate: "2026-02-01", isApproved: false, version: 1 },
    ],
    auditLog: [
      { id: "a7", date: "01 Feb 2026", time: "11:00 AM", user: "Maria Gonzalez", role: "estudiante", action: "Creo el expediente digital", detail: "Tipo: Derecho de peticion | Area: Civil" },
    ],
    hoursSpent: 4.0,
    hoursApproved: false,
  },
  {
    id: "3",
    radicado: "SICOP-2026-001236",
    clientName: "Pedro Martinez",
    clientDoc: "79456123",
    clientDocType: "CC",
    clientPhone: "3155551234",
    clientEmail: "pmartinez@correo.com",
    clientAddress: "Avenida 68 #23-45, Bogota",
    type: "Demanda",
    area: "Familia",
    status: "Aprobado",
    semaphore: "green",
    deadline: "2026-04-20",
    createdAt: "2026-01-20",
    assignedStudent: "Maria Gonzalez",
    assignedProfessor: "Dr. Perez",
    description: "Proceso de alimentos para menor de edad. Se requiere establecer cuota alimentaria.",
    isMinor: true,
    highRiskAlert: true,
    highRiskReason: "Caso involucra menor de edad - cuota alimentaria urgente",
    procesalDeadlines: [
      { id: "d4", name: "Radicacion demanda", dueDate: "2026-02-01", completed: true },
      { id: "d5", name: "Audiencia de conciliacion", dueDate: "2026-04-20", completed: false },
    ],
    reservedData: {
      hasMinor: true,
      hasGeneticData: false,
      hasPensionData: true,
      notes: "Menor: Sofia Martinez (8 anos). Datos pensionales del padre para calculo de cuota.",
    },
    substitutionHistory: [],
    aiTags: [],
    documents: [
      { id: "doc6", name: "demanda_alimentos_v3.docx", size: "310 KB", type: "docx", uploadedBy: "Maria Gonzalez", uploadDate: "2026-02-05", isApproved: true, version: 3 },
      { id: "doc7", name: "registro_civil_menor.pdf", size: "2.1 MB", type: "pdf", uploadedBy: "Maria Gonzalez", uploadDate: "2026-01-20", isApproved: true, version: 1 },
    ],
    auditLog: [
      { id: "a8", date: "20 Ene 2026", time: "9:00 AM", user: "Maria Gonzalez", role: "estudiante", action: "Creo el expediente digital", detail: "Tipo: Demanda | Area: Familia" },
      { id: "a9", date: "20 Ene 2026", time: "9:05 AM", user: "Dr. Perez", role: "profesor", action: "Marco caso como Alerta de Riesgo Juridico Alto", detail: "Involucra menor de edad" },
      { id: "a10", date: "05 Feb 2026", time: "3:00 PM", user: "Dr. Perez", role: "profesor", action: "Otorgo Visto Bueno final - Caso aprobado", detail: "Horas de practica aprobadas: 18h" },
    ],
    survey: { caseId: "3", rating: "satisfecho", comment: "Muy buen servicio.", date: "2026-03-01" },
    hoursSpent: 18.0,
    hoursApproved: true,
  },
  {
    id: "4",
    radicado: "SICOP-2026-001237",
    clientName: "Laura Sofia Torres",
    clientDoc: "1098765432",
    clientDocType: "CC",
    clientPhone: "3112223344",
    clientEmail: "ltorres@correo.com",
    clientAddress: "Calle 100 #45-67, Bogota",
    type: "Tutela",
    area: "Derecho Publico",
    status: "Seguimiento",
    semaphore: "yellow",
    deadline: "2026-02-18",
    createdAt: "2026-01-10",
    assignedStudent: "Maria Gonzalez",
    assignedProfessor: "Dra. Rodriguez",
    description: "Accion de tutela por vulneracion del derecho a la salud. EPS niega procedimiento.",
    isMinor: false,
    highRiskAlert: true,
    highRiskReason: "Riesgo de salud grave - procedimiento urgente negado por EPS",
    procesalDeadlines: [
      { id: "d6", name: "Radicacion tutela", dueDate: "2026-01-20", completed: true },
      { id: "d7", name: "Respuesta de la entidad", dueDate: "2026-02-18", completed: false },
    ],
    substitutionHistory: [
      { from: "Carlos Rodriguez", to: "Maria Gonzalez", date: "2026-01-25", reason: "Retiro del estudiante Carlos Rodriguez del consultorio" },
    ],
    aiTags: [],
    documents: [
      { id: "doc8", name: "tutela_salud_final.pdf", size: "320 KB", type: "pdf", uploadedBy: "Maria Gonzalez", uploadDate: "2026-01-18", isApproved: true, version: 1 },
    ],
    auditLog: [
      { id: "a11", date: "10 Ene 2026", time: "8:30 AM", user: "Carlos Rodriguez", role: "estudiante", action: "Creo el expediente digital" },
      { id: "a12", date: "25 Ene 2026", time: "10:00 AM", user: "Administrador", role: "administrativo", action: "Sustitucion de proceso", detail: "Carlos Rodriguez -> Maria Gonzalez" },
      { id: "a13b", date: "02 Feb 2026", time: "11:00 AM", user: "Dra. Rodriguez", role: "profesor", action: "Caso aprobado - Horas aprobadas", detail: "15.5 horas de practica aprobadas" },
    ],
    hoursSpent: 15.5,
    hoursApproved: true,
  },
  {
    id: "5",
    radicado: "SICOP-2026-001238",
    clientName: "Carlos Andres Ruiz",
    clientDoc: "80123456",
    clientDocType: "CC",
    clientPhone: "3167778899",
    clientEmail: "cruiz@correo.com",
    clientAddress: "Diagonal 50 #30-15, Bogota",
    type: "Consulta",
    area: "Penal",
    status: "Sustanciacion",
    semaphore: "red",
    deadline: "2026-02-05",
    createdAt: "2026-01-28",
    assignedStudent: "Maria Gonzalez",
    assignedProfessor: "Dr. Perez",
    description: "Consulta sobre presunta estafa en venta de bien inmueble.",
    isMinor: false,
    highRiskAlert: true,
    highRiskReason: "Posible perdida patrimonial significativa - estafa inmobiliaria",
    procesalDeadlines: [
      { id: "d8", name: "Analisis de hechos", dueDate: "2026-02-05", completed: false },
    ],
    substitutionHistory: [],
    interviewNotes: "<p>El usuario relata que compro un inmueble en <strong>noviembre 2025</strong> y el vendedor no le ha entregado la escritura.</p>",
    aiTags: [],
    documents: [
      { id: "doc9", name: "promesa_compraventa.pdf", size: "1.5 MB", type: "pdf", uploadedBy: "Maria Gonzalez", uploadDate: "2026-01-28", isApproved: false, version: 1 },
    ],
    auditLog: [
      { id: "a13", date: "28 Ene 2026", time: "2:00 PM", user: "Maria Gonzalez", role: "estudiante", action: "Creo el expediente digital", detail: "Tipo: Consulta | Area: Penal" },
    ],
    hoursSpent: 6.0,
    hoursApproved: false,
  },
  {
    id: "6",
    radicado: "SICOP-2026-001239",
    clientName: "Diana Marcela Ruiz",
    clientDoc: "1045678901",
    clientDocType: "CC",
    clientPhone: "3189990011",
    clientEmail: "druiz@correo.com",
    clientAddress: "Calle 26 #55-78, Bogota",
    type: "Demanda",
    area: "Laboral",
    status: "Sustanciacion",
    semaphore: "yellow",
    deadline: "2026-02-25",
    createdAt: "2026-02-05",
    assignedStudent: "Maria Gonzalez",
    assignedProfessor: "Dr. Perez",
    description: "Demanda por incumplimiento de contrato laboral y no pago de prestaciones sociales.",
    isMinor: false,
    highRiskAlert: false,
    procesalDeadlines: [
      { id: "d9", name: "Borrador demanda", dueDate: "2026-02-15", completed: false },
      { id: "d10", name: "Radicacion", dueDate: "2026-02-25", completed: false },
    ],
    substitutionHistory: [],
    aiTags: [],
    documents: [
      { id: "doc10", name: "borrador_demanda_laboral.docx", size: "198 KB", type: "docx", uploadedBy: "Maria Gonzalez", uploadDate: "2026-02-05", isApproved: false, version: 1 },
    ],
    auditLog: [
      { id: "a15", date: "05 Feb 2026", time: "3:30 PM", user: "Maria Gonzalez", role: "estudiante", action: "Creo el expediente digital", detail: "Tipo: Demanda | Area: Laboral" },
    ],
    hoursSpent: 8.0,
    hoursApproved: false,
  },
]

// ── Timeline events ──────────────────────────────────────────────────
export interface TimelineEvent {
  id: string
  date: string
  time: string
  user: string
  role: string
  action: string
}

export const mockTimeline: TimelineEvent[] = [
  { id: "1", date: "15 Ene 2026", time: "10:30 AM", user: "Maria Gonzalez", role: "Est", action: "Creo el caso" },
  { id: "3", date: "16 Ene 2026", time: "2:15 PM", user: "Dr. Perez", role: "Prof", action: "Devolvio con observaciones" },
  { id: "4", date: "17 Ene 2026", time: "9:00 AM", user: "Maria Gonzalez", role: "Est", action: "Adjunto el poder notariado y reenvio a revision" },
  { id: "5", date: "05 Feb 2026", time: "4:30 PM", user: "Dr. Perez", role: "Prof", action: "Aprobo el documento para radicacion" },
]

// ── Comments ─────────────────────────────────────────────────────────
export interface Comment {
  id: string
  user: string
  role: string
  avatar: string
  message: string
  timestamp: string
  hasAttachment?: boolean
  attachmentName?: string
}

export const mockComments: Comment[] = [
  { id: "1", user: "Maria Gonzalez", role: "Estudiante", avatar: "MG", message: "Dr. Perez, adjunto el borrador de la tutela para su revision. Incluyo los soportes medicos.", timestamp: "15 Ene 2026, 10:30 AM" },
  { id: "2", user: "Dr. Perez", role: "Profesor", avatar: "JP", message: "Maria, revise el documento. Le falta fundamentar el articulo 86 de la Constitucion.", timestamp: "16 Ene 2026, 2:15 PM" },
  { id: "3", user: "Maria Gonzalez", role: "Estudiante", avatar: "MG", message: "Listo profesor, ya corregi la fundamentacion y adjunte el certificado medico actualizado.", timestamp: "17 Ene 2026, 9:00 AM", hasAttachment: true, attachmentName: "tutela_corregida_v2.pdf" },
  { id: "4", user: "Dr. Perez", role: "Profesor", avatar: "JP", message: "Excelente trabajo Maria. El documento esta listo para radicacion. Proceda con la firma.", timestamp: "05 Feb 2026, 4:30 PM" },
]

// ── Calendar events ──────────────────────────────────────────────────
export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  duration: string
  type: "cita" | "deadline" | "reunion"
  client?: string
  clientEmail?: string
  modality?: "Presencial" | "Virtual"
  emailSent?: boolean
}

export const mockCalendarEvents: CalendarEvent[] = [
  { id: "1", title: "Cita con Juan Carlos Ramirez", date: "2026-02-10", time: "09:00", duration: "1h", type: "cita", client: "Juan Carlos Ramirez", clientEmail: "jramirez@correo.com", modality: "Presencial", emailSent: true },
  { id: "2", title: "Fecha limite - Tutela SICOP-2026-001234", date: "2026-02-08", time: "23:59", duration: "", type: "deadline" },
  { id: "3", title: "Reunion equipo laboral", date: "2026-02-12", time: "14:00", duration: "2h", type: "reunion", modality: "Virtual" },
  { id: "4", title: "Cita con Laura Sofia Torres", date: "2026-02-14", time: "10:30", duration: "1h", type: "cita", client: "Laura Sofia Torres", clientEmail: "ltorres@correo.com", modality: "Virtual", emailSent: true },
  { id: "5", title: "Fecha limite - Derecho peticion SICOP-2026-001235", date: "2026-03-15", time: "23:59", duration: "", type: "deadline" },
]

// ── Professor Inbox ──────────────────────────────────────────────────
export interface ProfessorInboxItem {
  id: string
  caseId: string
  from: string
  subject: string
  preview: string
  semaphore: SemaphoreColor
  date: string
  read: boolean
  phase: 1 | 2 | 3 | 4 | 5
  highRisk: boolean
  area: CaseArea
  radicado: string
  clientDoc: string
}

export const mockProfessorInbox: ProfessorInboxItem[] = [
  { id: "1", caseId: "1", from: "Maria Gonzalez", subject: "Revision: Tutela - Juan Carlos Ramirez", preview: "Radicado: SICOP-2026-001234 | Area: Laboral", semaphore: "red", date: "08 Feb 2026", read: false, phase: 2, highRisk: false, area: "Laboral", radicado: "SICOP-2026-001234", clientDoc: "1023456789" },
  { id: "2", caseId: "5", from: "Maria Gonzalez", subject: "Revision: Consulta - Carlos Andres Ruiz", preview: "Radicado: SICOP-2026-001238 | Area: Penal", semaphore: "red", date: "07 Feb 2026", read: false, phase: 1, highRisk: true, area: "Penal", radicado: "SICOP-2026-001238", clientDoc: "80123456" },
  { id: "3", caseId: "6", from: "Maria Gonzalez", subject: "Revision: Demanda - Diana Marcela Ruiz", preview: "Radicado: SICOP-2026-001239 | Area: Laboral", semaphore: "yellow", date: "06 Feb 2026", read: true, phase: 2, highRisk: false, area: "Laboral", radicado: "SICOP-2026-001239", clientDoc: "39876543" },
  { id: "4", caseId: "3", from: "Maria Gonzalez", subject: "Seguimiento: Demanda - Pedro Martinez", preview: "Radicado: SICOP-2026-001236 | Area: Familia", semaphore: "green", date: "05 Feb 2026", read: true, phase: 4, highRisk: true, area: "Familia", radicado: "SICOP-2026-001236", clientDoc: "1098765432" },
  { id: "5", caseId: "4", from: "Maria Gonzalez", subject: "Seguimiento: Tutela - Laura Sofia Torres", preview: "Radicado: SICOP-2026-001237 | Area: Derecho Publico", semaphore: "yellow", date: "04 Feb 2026", read: true, phase: 3, highRisk: true, area: "Derecho Publico", radicado: "SICOP-2026-001237", clientDoc: "52678901" },
  { id: "6", caseId: "7", from: "Maria Gonzalez", subject: "Cerrado: Consulta - Roberto Andres Lopez", preview: "Radicado: SICOP-2026-001240 | Area: Civil", semaphore: "green", date: "01 Feb 2026", read: true, phase: 5, highRisk: false, area: "Civil", radicado: "SICOP-2026-001240", clientDoc: "1045678901" },
]

// ── Admin: users for assignment ──────────────────────────────────────
export interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  area?: CaseArea
  activeCases: number
  totalPracticeHours: number
  semester: string
  practiceStartDate?: string // ISO date string - when the student started their 6-month practice
  docType?: DocType
  docNumber?: string
  practiceSuspension?: {
    startDate: string
    endDate: string
    reason: string
    isActive: boolean
  }
}

export const mockUsers: SystemUser[] = [
  { id: "u1", name: "Maria Gonzalez", email: "mgonzalez@universidad.edu.co", role: "estudiante", area: "Laboral", activeCases: 6, totalPracticeHours: 98, semester: "8vo Semestre", practiceStartDate: "2025-09-15", docType: "C.C.", docNumber: "1023456789" },
  { id: "u2", name: "Carlos Rodriguez", email: "crodriguez@universidad.edu.co", role: "estudiante", area: "Penal", activeCases: 3, totalPracticeHours: 45, semester: "7mo Semestre", practiceStartDate: "2025-11-01", docType: "C.C.", docNumber: "1098765432" },
  { id: "u3", name: "Ana Maria Lopez", email: "alopez@universidad.edu.co", role: "estudiante", area: "Familia", activeCases: 4, totalPracticeHours: 132, semester: "9no Semestre", practiceStartDate: "2025-06-01", docType: "T.I.", docNumber: "1045678901" },
  { id: "u4", name: "Dr. Perez", email: "jperez@universidad.edu.co", role: "profesor", area: "Laboral", activeCases: 12, totalPracticeHours: 0, semester: "", docType: "C.C.", docNumber: "79456123" },
  { id: "u5", name: "Dra. Rodriguez", email: "mrodriguez@universidad.edu.co", role: "profesor", area: "Civil", activeCases: 8, totalPracticeHours: 0, semester: "", docType: "C.C.", docNumber: "52345678" },
  { id: "u6", name: "Dr. Morales", email: "amorales@universidad.edu.co", role: "profesor", area: "Penal", activeCases: 10, totalPracticeHours: 0, semester: "", docType: "C.C.", docNumber: "80123456" },
  { id: "u7", name: "Sandra Milena Diaz", email: "sdiaz@universidad.edu.co", role: "administrativo", activeCases: 0, totalPracticeHours: 0, semester: "", docType: "C.C.", docNumber: "39876543" },
]

// ── Terminos Procesales Configuration ────────────────────────────────
export interface TerminoProcesal {
  id: string
  name: string
  defaultDays: number
  area: CaseArea
  description: string
  isActive: boolean
}

export const mockTerminosProcesales: TerminoProcesal[] = [
  { id: "tp1", name: "Tutela - Fallo primera instancia", defaultDays: 10, area: "Derecho Publico", description: "Plazo para fallo de primera instancia en accion de tutela", isActive: true },
  { id: "tp2", name: "Derecho de peticion - Respuesta", defaultDays: 15, area: "Civil", description: "Plazo para respuesta a derecho de peticion", isActive: true },
  { id: "tp3", name: "Demanda laboral - Contestacion", defaultDays: 20, area: "Laboral", description: "Plazo para contestacion de demanda laboral", isActive: true },
  { id: "tp4", name: "Demanda civil - Traslado", defaultDays: 10, area: "Civil", description: "Plazo de traslado de demanda civil", isActive: true },
  { id: "tp5", name: "Alimentos - Audiencia de conciliacion", defaultDays: 30, area: "Familia", description: "Plazo para audiencia de conciliacion en proceso de alimentos", isActive: true },
  { id: "tp6", name: "Recurso de apelacion", defaultDays: 3, area: "Penal", description: "Plazo para interponer recurso de apelacion", isActive: true },
]

// ── Phase helper ─────────────────────────────────────────────────────
export function getPhaseFromStatus(status: CaseStatus): 1 | 2 | 3 | 4 | 5 {
  switch (status) {
    case "Evaluacion":
    case "Sustanciacion":
      return 1
    case "Revision del profesor":
      return 2
    case "Aprobado":
      return 3
    case "Seguimiento":
      return 4
    case "Cerrado":
      return 5
  }
}

// ── Status flow order (RF-05) ────────────────────────────────────────
export const STATUS_FLOW: CaseStatus[] = [
  "Evaluacion",
  "Sustanciacion",
  "Revision del profesor",
  "Aprobado",
  "Seguimiento",
  "Cerrado",
]

export const STATUS_LABELS: Record<CaseStatus, string> = {
  Evaluacion: "Evaluacion",
  Sustanciacion: "Sustanciacion",
  "Revision del profesor": "Revision del profesor",
  Aprobado: "Aprobado",
  Seguimiento: "Seguimiento",
  Cerrado: "Cerrado",
}
