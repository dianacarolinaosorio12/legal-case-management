"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  FolderOpen,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Search,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Semaphore } from "@/components/semaphore"
import { mockCases } from "@/lib/mock-data"

const statusBadge: Record<string, string> = {
  Evaluacion: "bg-muted text-muted-foreground",
  Sustanciacion: "bg-accent/15 text-accent-foreground",
  "Revision del profesor": "bg-secondary/15 text-secondary",
  Aprobado: "bg-success/15 text-success",
  Seguimiento: "bg-primary/15 text-primary",
  Cerrado: "bg-muted text-muted-foreground",
}

export default function MisCasosPage() {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSemaphore, setFilterSemaphore] = useState("all")
  const [filterArea, setFilterArea] = useState("all")

  // KPI stats
  const activeCases = mockCases.filter((c) => c.status !== "Cerrado").length
  const inReview = mockCases.filter((c) => c.status === "Revision del profesor").length
  const redAlerts = mockCases.filter((c) => c.semaphore === "red")
  const totalHours = mockCases.reduce((sum, c) => sum + c.hoursSpent, 0)

  const stats = [
    {
      title: "Casos Activos",
      value: activeCases,
      icon: FolderOpen,
      color: "text-primary",
      bg: "bg-primary/10",
      borderColor: "border-l-primary",
    },
    {
      title: "En Revision",
      value: inReview,
      icon: Clock,
      color: "text-secondary",
      bg: "bg-secondary/10",
      borderColor: "border-l-secondary",
    },
    {
      title: "Alertas Rojas",
      value: redAlerts.length,
      icon: AlertCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      borderColor: "border-l-destructive",
    },
    {
      title: "Horas Totales",
      value: `${totalHours}h`,
      icon: Clock,
      color: "text-success",
      bg: "bg-success/10",
      borderColor: "border-l-success",
    },
  ]

  // Filtered cases
  const filteredCases = useMemo(() => {
    return mockCases.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        c.radicado.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.clientDoc.includes(q) ||
        c.assignedStudent.toLowerCase().includes(q) ||
        c.assignedProfessor.toLowerCase().includes(q)
      const matchStatus = filterStatus === "all" || c.status === filterStatus
      const matchSemaphore = filterSemaphore === "all" || c.semaphore === filterSemaphore
      const matchArea = filterArea === "all" || c.area === filterArea
      return matchSearch && matchStatus && matchSemaphore && matchArea
    })
  }, [search, filterStatus, filterSemaphore, filterArea])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">Mis Casos</h1>
        <Button asChild className="flex items-center gap-2">
          <Link href="/dashboard/nuevo-caso">
            <Plus size={16} aria-hidden="true" />
            Nuevo Caso
          </Link>
        </Button>
      </div>

      {/* Critical Alerts Banner */}
      {redAlerts.length > 0 && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <span className="font-medium text-destructive">
              Tienes {redAlerts.length} caso(s) proximos a vencer. Revisa inmediatamente.
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setFilterSemaphore("red")}
          >
            Ver casos urgentes
          </Button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`border-border border-l-4 ${stat.borderColor} card-hover shadow-card`}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.title}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <label htmlFor="search" className="text-sm font-medium text-foreground">
                Buscar por nombre, radicado, documento, estudiante o profesor
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="search"
                  placeholder="Ej: SICOP-2024, Juan Carlos, 1023456789..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-2">
              <label htmlFor="filterArea" className="text-sm font-medium text-foreground">
                Area juridica
              </label>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger id="filterArea" className="w-full sm:w-44">
                  <SelectValue placeholder="Todas las areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Penal">Penal</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Laboral">Laboral</SelectItem>
                  <SelectItem value="Familia">Familia</SelectItem>
                  <SelectItem value="Derecho Publico">Derecho Publico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="filterStatus" className="text-sm font-medium text-foreground">
                Estado
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filterStatus" className="w-full sm:w-48">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Evaluacion">Evaluacion</SelectItem>
                  <SelectItem value="Sustanciacion">Sustanciacion</SelectItem>
                  <SelectItem value="Revision del profesor">Revision del profesor</SelectItem>
                  <SelectItem value="Aprobado">Aprobado</SelectItem>
                  <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                  <SelectItem value="Cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="filterSemaphore" className="text-sm font-medium text-foreground">
                Semaforo
              </label>
              <Select value={filterSemaphore} onValueChange={setFilterSemaphore}>
                <SelectTrigger id="filterSemaphore" className="w-full sm:w-40">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="red">Rojo - Urgente</SelectItem>
                  <SelectItem value="yellow">Amarillo - Precaucion</SelectItem>
                  <SelectItem value="green">Verde - En tiempo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(filterStatus !== "all" || filterSemaphore !== "all" || filterArea !== "all" || search) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setSearch("")
                  setFilterStatus("all")
                  setFilterSemaphore("all")
                  setFilterArea("all")
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredCases.length} caso(s) encontrado(s)
      </p>

      {/* Cases Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-12">
                    <span className="sr-only">Semaforo</span>
                  </TableHead>
                  <TableHead>Radicado</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Area</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">Profesor</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha limite</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Horas</TableHead>
                  <TableHead className="w-16">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Filter size={32} />
                        <p>No se encontraron casos con los filtros aplicados.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Semaphore color={c.semaphore} size="md" />
                          {c.highRiskAlert && (
                            <AlertTriangle size={14} className="text-destructive" aria-label="Riesgo alto" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-medium text-foreground">
                          {c.radicado}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-foreground">{c.clientName}</span>
                          <span className="text-xs text-muted-foreground">
                            {c.clientDocType} {c.clientDoc}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {c.type}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {c.area}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusBadge[c.status] || ""}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {c.assignedProfessor}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {new Date(c.deadline).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        <span className="font-bold text-foreground">{c.hoursSpent}h</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild aria-label={`Ver caso ${c.radicado}`}>
                          <Link href={`/dashboard/casos/${c.id}`}>
                            <Eye size={18} />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-accent text-accent-foreground hover:bg-accent/90"
          asChild
          aria-label="Crear nuevo caso"
        >
          <Link href="/dashboard/nuevo-caso">
            <Plus size={24} />
          </Link>
        </Button>
      </div>
    </div>
  )
}
