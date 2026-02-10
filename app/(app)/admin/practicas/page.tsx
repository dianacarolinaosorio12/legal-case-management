"use client"

import { useState } from "react"
import { Clock, GraduationCap, Users, BarChart3, ChevronDown, ChevronRight } from "lucide-react"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { mockUsers, mockCases } from "@/lib/mock-data"

const TARGET_HOURS = 120

// Filter only students
const students = mockUsers.filter((u) => u.role === "estudiante")

// Get cases for a specific student
function getStudentCases(studentName: string) {
  return mockCases.filter((c) => c.assignedStudent === studentName)
}

// Summary calculations
const totalHours = students.reduce((sum, s) => sum + s.totalPracticeHours, 0)
const averageHours = students.length > 0 ? Math.round(totalHours / students.length) : 0
const activeStudents = students.length

// Status badge helper
function getEstado(hours: number) {
  if (hours >= TARGET_HOURS) {
    return { label: "Completado", variant: "default" as const, className: "bg-green-600 hover:bg-green-700 text-white" }
  }
  if (hours >= 60) {
    return { label: "En curso", variant: "default" as const, className: "bg-yellow-500 hover:bg-yellow-600 text-white" }
  }
  return { label: "Inicial", variant: "secondary" as const, className: "bg-gray-400 hover:bg-gray-500 text-white" }
}

const summaryCards = [
  {
    title: "Total horas registradas",
    value: totalHours,
    icon: Clock,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Promedio por estudiante",
    value: `${averageHours}h`,
    icon: BarChart3,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    title: "Estudiantes activos",
    value: activeStudents,
    icon: Users,
    color: "text-success",
    bg: "bg-success/10",
  },
]

export default function PracticasPage() {
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())

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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">
          Practicas Estudiantiles
        </h1>
        <p className="text-sm text-muted-foreground">
          Seguimiento de horas de practica y progreso de los estudiantes del consultorio juridico.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title} className="border-border shadow-card card-hover">
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} aria-hidden="true" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground">{card.value}</span>
                <p className="text-sm text-muted-foreground">{card.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student Practice Table */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <GraduationCap size={18} aria-hidden="true" />
            Registro de Horas por Estudiante
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead className="hidden sm:table-cell">Semestre</TableHead>
                  <TableHead className="hidden md:table-cell">Casos asignados</TableHead>
                  <TableHead>Horas totales</TableHead>
                  <TableHead className="hidden sm:table-cell">% completado</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const studentCases = getStudentCases(student.name)
                  const percentage = Math.min(
                    Math.round((student.totalPracticeHours / TARGET_HOURS) * 100),
                    100
                  )
                  const estado = getEstado(student.totalPracticeHours)

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
                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                          <span className="text-sm font-medium text-foreground">
                            {student.totalPracticeHours}h / {TARGET_HOURS}h
                          </span>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm font-medium text-foreground">{percentage}%</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={estado.className}>{estado.label}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Desglose por Estudiante</h2>

        {students.map((student) => {
          const studentCases = getStudentCases(student.name)
          const isExpanded = expandedStudents.has(student.id)
          const percentage = Math.min(
            Math.round((student.totalPracticeHours / TARGET_HOURS) * 100),
            100
          )
          const estado = getEstado(student.totalPracticeHours)

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
                            <Badge className={estado.className} >{estado.label}</Badge>
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
                              <TableHead className="hidden sm:table-cell">Estado del caso</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentCases.map((c) => (
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
                                  <span className="text-sm font-medium text-foreground">{c.hoursSpent}h</span>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge variant="outline">{c.status}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
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
      </div>
    </div>
  )
}
