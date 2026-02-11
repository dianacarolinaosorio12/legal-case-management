"use client"

import { useState, useMemo } from "react"
import {
  Clock,
  GraduationCap,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Search,
  CalendarDays,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  PauseCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { mockUsers, mockCases, TODAY, getPhaseFromStatus } from "@/lib/mock-data"

const MAX_HOURS_WEEK = 8
const MAX_HOURS_MONTH = 32
const PRACTICE_DURATION_MONTHS = 6
const TARGET_HOURS = MAX_HOURS_MONTH * PRACTICE_DURATION_MONTHS // 192h estimadas

// Filter only students
const students = mockUsers.filter((u) => u.role === "estudiante")

// Get cases for a specific student
function getStudentCases(studentName: string) {
  return mockCases.filter((c) => c.assignedStudent === studentName)
}

// Calculate months elapsed since practice start
function getMonthsElapsed(startDate: string): number {
  const start = new Date(startDate)
  const diffMs = TODAY.getTime() - start.getTime()
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44)
  return Math.max(0, Math.round(diffMonths * 10) / 10)
}

// Calculate months remaining (6 months total)
function getMonthsRemaining(startDate: string): number {
  const elapsed = getMonthsElapsed(startDate)
  return Math.max(0, Math.round((PRACTICE_DURATION_MONTHS - elapsed) * 10) / 10)
}

// Get end date of practice
function getPracticeEndDate(startDate: string): Date {
  const start = new Date(startDate)
  return new Date(start.getFullYear(), start.getMonth() + PRACTICE_DURATION_MONTHS, start.getDate())
}

// Practice time status
function getPracticeTimeStatus(startDate: string) {
  const remaining = getMonthsRemaining(startDate)
  if (remaining <= 0) {
    return { label: "Tiempo finalizado", color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle }
  }
  if (remaining <= 1) {
    return { label: "Proximo a finalizar", color: "text-yellow-600", bg: "bg-yellow-500/10", icon: Hourglass }
  }
  return { label: "En curso", color: "text-success", bg: "bg-success/10", icon: Timer }
}

// Hours status badge
function getEstado(hours: number, startDate?: string) {
  if (hours >= TARGET_HOURS) {
    return { label: "Completado", className: "bg-green-600 hover:bg-green-700 text-white" }
  }
  if (startDate && getMonthsRemaining(startDate) <= 0) {
    return { label: "Tiempo agotado", className: "bg-destructive hover:bg-destructive/90 text-white" }
  }
  if (hours >= 60) {
    return { label: "En curso", className: "bg-yellow-500 hover:bg-yellow-600 text-white" }
  }
  return { label: "Inicial", className: "bg-gray-400 hover:bg-gray-500 text-white" }
}

// Suspension data type
interface SuspensionData {
  startDate: string
  endDate: string
  reason: string
  exceedsThreeMonths: boolean
  status: "suspendida" | "anulada" // anulada = >3 meses, debe reiniciar desde cero
}

// Calculate whether a suspension exceeds 3 months
function suspensionExceedsThreeMonths(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end.getTime() - start.getTime()
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44)
  return diffMonths > 3
}

// Calculate suspension days
function getSuspensionDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

// Summary calculations
const totalHours = students.reduce((sum, s) => sum + s.totalPracticeHours, 0)
const averageHours = students.length > 0 ? Math.round(totalHours / students.length) : 0
const activeStudents = students.length
const completedStudents = students.filter((s) => s.totalPracticeHours >= TARGET_HOURS).length

export default function PracticasPage() {
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterEstado, setFilterEstado] = useState("all")

  // Suspension dialog state
  const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false)
  const [suspensionTargetStudent, setSuspensionTargetStudent] = useState<string | null>(null)
  const [suspensionStartDate, setSuspensionStartDate] = useState("")
  const [suspensionEndDate, setSuspensionEndDate] = useState("")
  const [suspensionReason, setSuspensionReason] = useState("")
  const [suspendedStudents, setSuspendedStudents] = useState<Map<string, SuspensionData>>(new Map())

  const suspensionExceeds = suspensionExceedsThreeMonths(suspensionStartDate, suspensionEndDate)

  function openSuspensionDialog(studentId: string) {
    setSuspensionTargetStudent(studentId)
    setSuspensionStartDate("")
    setSuspensionEndDate("")
    setSuspensionReason("")
    setSuspensionDialogOpen(true)
  }

  function confirmSuspension() {
    if (!suspensionTargetStudent || !suspensionStartDate || !suspensionEndDate || !suspensionReason) return
    const exceeds = suspensionExceedsThreeMonths(suspensionStartDate, suspensionEndDate)
    setSuspendedStudents((prev) => {
      const next = new Map(prev)
      next.set(suspensionTargetStudent, {
        startDate: suspensionStartDate,
        endDate: suspensionEndDate,
        reason: suspensionReason,
        exceedsThreeMonths: exceeds,
        status: exceeds ? "anulada" : "suspendida",
      })
      return next
    })
    setSuspensionDialogOpen(false)
    setSuspensionTargetStudent(null)
  }

  function toggleStudent(studentId: string) {
    setExpandedStudents((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }
      return next
    })
  }

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase()
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.semester.toLowerCase().includes(q) ||
        (s.docNumber && s.docNumber.includes(searchQuery)) ||
        (s.docType && s.docType.toLowerCase().includes(q))

      let matchEstado = true
      if (filterEstado !== "all") {
        const estado = getEstado(s.totalPracticeHours, s.practiceStartDate)
        matchEstado = estado.label.toLowerCase() === filterEstado.toLowerCase()
      }

      return matchSearch && matchEstado
    })
  }, [searchQuery, filterEstado])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">
          Practicas Estudiantiles
        </h1>
        <p className="text-sm text-muted-foreground">
          Seguimiento de horas de practica, tiempo transcurrido y progreso de los estudiantes.
        </p>
      </div>

      {/* Time Rules Card */}
      <Card className="border-border bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Timer className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Reglas de horas de practica</p>
                <p className="text-xs text-muted-foreground">El conteo de horas depende de los terminos procesales de cada caso</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Clock size={12} className="mr-1" /> Max {MAX_HOURS_WEEK}h/semana
              </Badge>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                <CalendarDays size={12} className="mr-1" /> Max {MAX_HOURS_MONTH}h/mes
              </Badge>
              <Badge variant="secondary" className="bg-success/10 text-success">
                <Timer size={12} className="mr-1" /> {PRACTICE_DURATION_MONTHS} meses de duracion
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suspension Rules Info */}
      <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-orange-500" aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">Regla de suspension de practicas</p>
          <p className="text-xs text-muted-foreground">
            Si una practica se suspende por <strong className="text-foreground">mas de 3 meses</strong>, esta se anula automaticamente
            y el estudiante debera <strong className="text-foreground">reiniciar la practica desde cero</strong>. No se podra reanudar la practica anterior.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-border shadow-card card-hover">
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <span className="text-3xl font-bold text-foreground">{totalHours}h</span>
              <p className="text-sm text-muted-foreground">Total horas registradas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card card-hover">
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <BarChart3 className="h-5 w-5 text-secondary" aria-hidden="true" />
            </div>
            <div>
              <span className="text-3xl font-bold text-foreground">{averageHours}h</span>
              <p className="text-sm text-muted-foreground">Promedio por estudiante</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card card-hover">
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Users className="h-5 w-5 text-success" aria-hidden="true" />
            </div>
            <div>
              <span className="text-3xl font-bold text-foreground">{activeStudents}</span>
              <p className="text-sm text-muted-foreground">Estudiantes activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card card-hover">
          <CardContent className="flex flex-col gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <CheckCircle2 className="h-5 w-5 text-accent-foreground" aria-hidden="true" />
            </div>
            <div>
              <span className="text-3xl font-bold text-foreground">{completedStudents}</span>
              <p className="text-sm text-muted-foreground">Practicas completadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="border-border shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-2 flex-1">
              <label htmlFor="searchStudent" className="text-sm font-medium text-foreground">
                Buscar estudiante
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="searchStudent"
                  placeholder="Nombre, correo, semestre o No. documento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="filterEstado" className="text-sm font-medium text-foreground">
                Estado
              </label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger id="filterEstado" className="w-full sm:w-48 h-10">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="inicial">Inicial</SelectItem>
                  <SelectItem value="en curso">En curso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="tiempo agotado">Tiempo agotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground self-end pb-2">
              {filteredStudents.length} estudiante(s)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Student Practice Table */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <GraduationCap size={18} aria-hidden="true" />
            Registro de Horas y Tiempo de Practicas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Estudiante</TableHead>
                  <TableHead className="hidden sm:table-cell">Semestre</TableHead>
                  <TableHead className="hidden md:table-cell">Casos</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead className="hidden sm:table-cell">Progreso</TableHead>
                  <TableHead className="hidden lg:table-cell">Inicio practica</TableHead>
                  <TableHead className="hidden md:table-cell">Tiempo transcurrido</TableHead>
                  <TableHead>Meses restantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden sm:table-cell">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const studentCases = getStudentCases(student.name)
                  const percentage = Math.min(
                    Math.round((student.totalPracticeHours / TARGET_HOURS) * 100),
                    100
                  )
                  const estado = getEstado(student.totalPracticeHours, student.practiceStartDate)
                  const monthsElapsed = student.practiceStartDate ? getMonthsElapsed(student.practiceStartDate) : 0
                  const monthsRemaining = student.practiceStartDate ? getMonthsRemaining(student.practiceStartDate) : PRACTICE_DURATION_MONTHS
                  const timeStatus = student.practiceStartDate ? getPracticeTimeStatus(student.practiceStartDate) : null
                  const endDate = student.practiceStartDate ? getPracticeEndDate(student.practiceStartDate) : null

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{student.name}</span>
                          <span className="text-xs text-muted-foreground sm:hidden">
                            {student.semester}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {student.semester}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-foreground">
                        {studentCases.length}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 min-w-[100px]">
                          <span className="text-sm font-medium text-foreground">
                            {student.totalPracticeHours}h / {TARGET_HOURS}h
                          </span>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm font-medium text-foreground">{percentage}%</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {student.practiceStartDate ? (
                          <div className="flex flex-col">
                            <span className="text-sm text-foreground">
                              {new Date(student.practiceStartDate).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Hasta: {endDate?.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin fecha</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-foreground">{monthsElapsed} meses</span>
                      </TableCell>
                      <TableCell>
                        {timeStatus ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${monthsRemaining <= 1 ? "text-destructive" : monthsRemaining <= 2 ? "text-yellow-600" : "text-success"}`}>
                              {monthsRemaining}
                            </span>
                            <span className="text-xs text-muted-foreground">meses</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge className={estado.className}>{estado.label}</Badge>
                          {suspendedStudents.has(student.id) && (
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                              {suspendedStudents.get(student.id)!.exceedsThreeMonths ? "Anulada" : "Suspendida"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                          onClick={() => openSuspensionDialog(student.id)}
                        >
                          <PauseCircle size={14} className="mr-1.5" />
                          <span className="hidden lg:inline">Suspender</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No se encontraron estudiantes con los filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Desglose por Estudiante</h2>

        {filteredStudents.map((student) => {
          const studentCases = getStudentCases(student.name)
          const isExpanded = expandedStudents.has(student.id)
          const percentage = Math.min(
            Math.round((student.totalPracticeHours / TARGET_HOURS) * 100),
            100
          )
          const estado = getEstado(student.totalPracticeHours, student.practiceStartDate)
          const monthsElapsed = student.practiceStartDate ? getMonthsElapsed(student.practiceStartDate) : 0
          const monthsRemaining = student.practiceStartDate ? getMonthsRemaining(student.practiceStartDate) : PRACTICE_DURATION_MONTHS
          const timeStatus = student.practiceStartDate ? getPracticeTimeStatus(student.practiceStartDate) : null

          return (
            <Collapsible key={student.id} open={isExpanded} onOpenChange={() => toggleStudent(student.id)}>
              <Card className="border-border shadow-card card-hover">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer select-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
                        ) : (
                          <ChevronRight size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                          <CardTitle className="text-base text-foreground">{student.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1 sm:mt-0">
                            <span className="text-xs text-muted-foreground">{student.semester}</span>
                            <Badge className={estado.className}>{estado.label}</Badge>
                            {suspendedStudents.has(student.id) && (
                              <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                                {suspendedStudents.get(student.id)!.exceedsThreeMonths ? "Anulada" : "Suspendida"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">
                          {student.totalPracticeHours}h / {TARGET_HOURS}h
                        </span>
                        <div className="w-24">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground w-10 text-right">{percentage}%</span>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Time Overview */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
                      <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-3">
                        <span className="text-xs text-muted-foreground">Inicio de practica</span>
                        <span className="text-sm font-medium text-foreground">
                          {student.practiceStartDate
                            ? new Date(student.practiceStartDate).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
                            : "Sin asignar"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-3">
                        <span className="text-xs text-muted-foreground">Tiempo transcurrido</span>
                        <span className="text-sm font-medium text-foreground">{monthsElapsed} meses</span>
                      </div>
                      <div className={`flex flex-col gap-1 rounded-lg border p-3 ${monthsRemaining <= 1 ? "border-destructive/30 bg-destructive/5" : monthsRemaining <= 2 ? "border-yellow-500/30 bg-yellow-500/5" : "border-success/30 bg-success/5"}`}>
                        <span className="text-xs text-muted-foreground">Meses restantes</span>
                        <span className={`text-sm font-bold ${monthsRemaining <= 1 ? "text-destructive" : monthsRemaining <= 2 ? "text-yellow-600" : "text-success"}`}>
                          {monthsRemaining} meses
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-3">
                        <span className="text-xs text-muted-foreground">Horas estimadas max.</span>
                        <span className="text-sm font-medium text-foreground">
                          {TARGET_HOURS}h ({MAX_HOURS_MONTH}h/mes)
                        </span>
                      </div>
                    </div>

                    {/* Time Progress Bar */}
                    <div className="mb-4 flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-muted-foreground" aria-hidden="true" />
                          <span className="text-xs font-medium text-foreground">Progreso temporal ({PRACTICE_DURATION_MONTHS} meses)</span>
                        </div>
                        {timeStatus && (
                          <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${timeStatus.bg} ${timeStatus.color}`}>
                            <timeStatus.icon size={12} />
                            {timeStatus.label}
                          </div>
                        )}
                      </div>
                      <Progress
                        value={Math.min((monthsElapsed / PRACTICE_DURATION_MONTHS) * 100, 100)}
                        className="h-2.5"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Inicio</span>
                        <span>{monthsElapsed} de {PRACTICE_DURATION_MONTHS} meses</span>
                        <span>Fin</span>
                      </div>
                    </div>

                    {/* Time Logic Indicators */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3">
                        <Clock size={14} className="text-primary shrink-0" aria-hidden="true" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Limite semanal</span>
                          <span className="text-sm font-semibold text-foreground">Max {MAX_HOURS_WEEK} horas/semana</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3">
                        <CalendarDays size={14} className="text-primary shrink-0" aria-hidden="true" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Limite mensual</span>
                          <span className="text-sm font-semibold text-foreground">{MAX_HOURS_MONTH} horas/mes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3">
                        <Timer size={14} className="text-primary shrink-0" aria-hidden="true" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Duracion total</span>
                          <span className="text-sm font-semibold text-foreground">{PRACTICE_DURATION_MONTHS} meses</span>
                        </div>
                      </div>
                    </div>

                    {/* Suspension Info & Button */}
                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 rounded-lg border p-3 ${
                      suspendedStudents.has(student.id) && suspendedStudents.get(student.id)!.exceedsThreeMonths
                        ? "border-destructive/30 bg-destructive/5"
                        : suspendedStudents.has(student.id)
                          ? "border-orange-300 bg-orange-50"
                          : "border-border bg-muted/10"
                    }`}>
                      {suspendedStudents.has(student.id) ? (
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <PauseCircle size={14} className={suspendedStudents.get(student.id)!.exceedsThreeMonths ? "text-destructive" : "text-orange-500"} />
                            <span className={`text-sm font-medium ${suspendedStudents.get(student.id)!.exceedsThreeMonths ? "text-destructive" : "text-orange-600"}`}>
                              {suspendedStudents.get(student.id)!.exceedsThreeMonths
                                ? "Practica ANULADA - Debe reiniciar desde cero"
                                : "Practica suspendida temporalmente"}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Desde: {new Date(suspendedStudents.get(student.id)!.startDate).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                            {" - "}Hasta: {new Date(suspendedStudents.get(student.id)!.endDate).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                            {" "}({getSuspensionDays(suspendedStudents.get(student.id)!.startDate, suspendedStudents.get(student.id)!.endDate)} dias)
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Motivo: {suspendedStudents.get(student.id)!.reason}
                          </span>
                          {suspendedStudents.get(student.id)!.exceedsThreeMonths && (
                            <div className="mt-1 rounded border border-destructive/20 bg-destructive/10 px-2 py-1.5">
                              <p className="text-xs text-destructive font-medium">
                                La suspension supero 3 meses. Las horas anteriores no son validas. El estudiante debe reiniciar su practica completamente.
                              </p>
                            </div>
                          )}
                          {!suspendedStudents.get(student.id)!.exceedsThreeMonths && (
                            <p className="text-xs text-orange-600 mt-0.5">
                              Si la suspension supera los 3 meses, la practica se anulara automaticamente.
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          La practica se encuentra activa. Puede suspenderla si es necesario.
                        </span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          openSuspensionDialog(student.id)
                        }}
                      >
                        <PauseCircle size={14} className="mr-1.5" />
                        {suspendedStudents.has(student.id) && suspendedStudents.get(student.id)!.exceedsThreeMonths
                          ? "Reiniciar Practica"
                          : "Suspender Practica"
                        }
                      </Button>
                    </div>

                    {studentCases.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No hay casos asignados a este estudiante.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Radicado</TableHead>
                              <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                              <TableHead className="hidden md:table-cell">Area</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Horas</TableHead>
                              <TableHead className="hidden sm:table-cell">Fase</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentCases.map((c) => {
                              const phase = getPhaseFromStatus(c.status)
                              const PHASE_LABELS: Record<number, string> = { 1: "Evaluacion", 2: "Revision", 3: "Aprobacion", 4: "Seguimiento", 5: "Cerrado" }
                              return (
                                <TableRow key={c.id}>
                                  <TableCell>
                                    <span className="font-mono text-xs text-foreground">{c.radicado}</span>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                                    {c.type}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-muted-foreground">
                                    {c.area}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className="text-sm text-foreground">{c.clientName}</span>
                                      <span className="text-xs text-muted-foreground sm:hidden">{c.type}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm font-medium text-foreground">{c.hoursSpent}h</span>
                                      {c.hoursApproved ? (
                                        <CheckCircle2 size={14} className="text-success" />
                                      ) : (
                                        <Clock size={14} className="text-muted-foreground" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden sm:table-cell">
                                    <Badge variant="outline">Fase {phase} - {PHASE_LABELS[phase]}</Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                            <TableRow className="bg-muted/50">
                              <TableCell
                                colSpan={4}
                                className="text-right font-medium text-foreground"
                              >
                                Total horas en casos:
                              </TableCell>
                              <TableCell className="font-bold text-foreground">
                                {studentCases.reduce((sum, c) => sum + c.hoursSpent, 0)}h
                              </TableCell>
                              <TableCell className="hidden sm:table-cell" />
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}

        {filteredStudents.length === 0 && (
          <Card className="border-border">
            <CardContent className="py-8 text-center text-muted-foreground">
              No se encontraron estudiantes con los filtros aplicados.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Suspension Dialog */}
      <Dialog open={suspensionDialogOpen} onOpenChange={setSuspensionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PauseCircle size={18} className="text-orange-500" />
              Suspender Practica
            </DialogTitle>
            <DialogDescription>
              Ingrese los datos de la suspension para el estudiante{" "}
              <span className="font-medium text-foreground">
                {students.find((s) => s.id === suspensionTargetStudent)?.name ?? ""}
              </span>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="suspensionStart">Fecha de inicio</Label>
              <Input
                id="suspensionStart"
                type="date"
                value={suspensionStartDate}
                onChange={(e) => setSuspensionStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="suspensionEnd">Fecha de fin</Label>
              <Input
                id="suspensionEnd"
                type="date"
                value={suspensionEndDate}
                onChange={(e) => setSuspensionEndDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="suspensionReason">Motivo de la suspension</Label>
              <Textarea
                id="suspensionReason"
                placeholder="Describa el motivo de la suspension..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
              />
            </div>

            {suspensionExceeds && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Suspension mayor a 3 meses - Practica anulada</AlertTitle>
                <AlertDescription>
                  La suspension supera los 3 meses permitidos. La practica del estudiante sera <strong>anulada permanentemente</strong> y
                  debera <strong>reiniciar desde cero</strong>. Las horas acumuladas anteriormente no seran validas.
                  Esta accion no se puede revertir.
                </AlertDescription>
              </Alert>
            )}

            {!suspensionExceeds && suspensionStartDate && suspensionEndDate && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Duracion de la suspension: <strong className="text-foreground">{getSuspensionDays(suspensionStartDate, suspensionEndDate)} dias</strong>.
                  La practica podra reanudarse al finalizar la suspension. Si la suspension supera los 3 meses, la practica sera anulada.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSuspensionDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!suspensionStartDate || !suspensionEndDate || !suspensionReason}
              onClick={confirmSuspension}
            >
              {suspensionExceeds ? "Confirmar Anulacion" : "Confirmar Suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
