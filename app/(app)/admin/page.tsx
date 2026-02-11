"use client"

import React from "react"

import { useState, useMemo } from "react"
import {
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  UserCircle,
  Upload,
  ArrowRightLeft,
  Shield,
  FileText,
  Users,
  X,
  Search,
  ArrowUpRight,
  CalendarDays,
  Timer,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Semaphore } from "@/components/semaphore"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Legend,
  Tooltip,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { mockCases, mockUsers, getSemaphoreFromDeadline, getSemaphoreLabel, getPhaseFromStatus, TODAY } from "@/lib/mock-data"

// RF-13: KPI calculations from mock data
const activeCases = mockCases.filter((c) => c.status !== "Cerrado").length
const pendingCases = mockCases.filter((c) => c.status === "Evaluacion" || c.status === "Sustanciacion").length
const attendedCases = mockCases.filter((c) => c.status === "Aprobado" || c.status === "Seguimiento").length
const overdueCases = mockCases.filter((c) => getSemaphoreFromDeadline(c.deadline) === "red").length
const closedThisMonth = mockCases.filter((c) => c.status === "Cerrado").length
const avgResolutionDays = 18 // mock average

const kpis = [
  {
    title: "Casos Activos",
    value: String(activeCases),
    change: "+12%",
    changeLabel: "vs mes pasado",
    icon: FolderOpen,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Casos Pendientes",
    value: String(pendingCases),
    change: "",
    changeLabel: "en evaluacion o sustanciacion",
    icon: Clock,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    title: "Casos Atendidos",
    value: String(attendedCases),
    change: "",
    changeLabel: "aprobados o en seguimiento",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    title: "Casos Vencidos",
    value: String(overdueCases),
    change: overdueCases > 0 ? "Vencido" : "",
    changeLabel: "requiere atencion inmediata",
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    title: "Cerrados este Mes",
    value: String(closedThisMonth),
    change: "",
    changeLabel: "casos finalizados",
    icon: CalendarDays,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    title: "Promedio Dias Resolucion",
    value: String(avgResolutionDays),
    change: "-3d",
    changeLabel: "vs mes pasado",
    icon: Timer,
    color: "text-primary",
    bg: "bg-primary/10",
  },
]

const casesByArea = [
  { area: "Penal", cases: 45 },
  { area: "Civil", cases: 89 },
  { area: "Laboral", cases: 56 },
  { area: "Familia", cases: 34 },
  { area: "Publico", cases: 10 },
]

const BAR_COLORS = ["#030568", "#2c3eaa", "#facc15", "#1a8a5c", "#dc2626"]

const PHASE_LABELS: Record<number, string> = {
  1: "Evaluacion",
  2: "Revision",
  3: "Aprobacion",
  4: "Seguimiento",
  5: "Cerrado",
}

const phaseBadge: Record<number, string> = {
  1: "bg-muted text-muted-foreground",
  2: "bg-secondary/15 text-secondary",
  3: "bg-success/15 text-success",
  4: "bg-primary/15 text-primary",
  5: "bg-muted text-muted-foreground",
}

const casesByStatus = [
  { name: "Fase 1 - Evaluacion", value: 45, fill: "#6b7280" },
  { name: "Fase 2 - Revision", value: 30, fill: "#2c3eaa" },
  { name: "Fase 3 - Aprobacion", value: 15, fill: "#1a8a5c" },
  { name: "Fase 4 - Seguimiento", value: 10, fill: "#facc15" },
  { name: "Cerrado", value: 8, fill: "#9ca3af" },
]

const recentActivity = [
  { time: "Hace 5 min", user: "Maria Gonzalez", action: "Creo caso SICOP-2024-001242" },
  { time: "Hace 15 min", user: "Dr. Perez", action: "Aprobo caso SICOP-2024-001236" },
  { time: "Hace 1 hora", user: "Dra. Rodriguez", action: "Devolvio caso SICOP-2024-001241" },
  { time: "Hace 2 horas", user: "Admin", action: "Reasigno caso SICOP-2024-001230" },
  { time: "Hace 3 horas", user: "Admin", action: "Sustitucion: Carlos -> Maria en SICOP-2024-001237" },
]

export default function AdminDashboard() {
  // RF-25: Reassignment dialog state
  const [showReassignDialog, setShowReassignDialog] = useState(false)
  const [reassignCase, setReassignCase] = useState("")
  const [reassignReason, setReassignReason] = useState("")
  const [reassignStudentSearch, setReassignStudentSearch] = useState("")
  const [reassignSelectedStudent, setReassignSelectedStudent] = useState("")
  const [reassignDropdownOpen, setReassignDropdownOpen] = useState(false)

  // RF-06: Assignment dialog state
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [assignCaseSearch, setAssignCaseSearch] = useState("")
  const [assignProfSearch, setAssignProfSearch] = useState("")
  const [assignSelectedCase, setAssignSelectedCase] = useState("")
  const [assignSelectedProf, setAssignSelectedProf] = useState("")
  const [assignCaseDropdownOpen, setAssignCaseDropdownOpen] = useState(false)
  const [assignProfDropdownOpen, setAssignProfDropdownOpen] = useState(false)

  // RF-24: Bulk upload dialog state
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false)
  const [bulkFiles, setBulkFiles] = useState<{ name: string; size: string }[]>([])

  // Case list filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterArea, setFilterArea] = useState("all")
  const [filterPhase, setFilterPhase] = useState("all")

  const filteredCases = useMemo(() => {
    return mockCases.filter((c) => {
      const matchSearch =
        searchQuery === "" ||
        c.radicado.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.assignedStudent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.assignedProfessor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientDoc.includes(searchQuery)
      const matchArea = filterArea === "all" || c.area === filterArea
      const matchPhase = filterPhase === "all" || getPhaseFromStatus(c.status) === Number(filterPhase)
      return matchSearch && matchArea && matchPhase
    })
  }, [searchQuery, filterArea, filterPhase])

  const uniqueAreas = [...new Set(mockCases.map((c) => c.area))]

  function handleBulkDrop(e: React.DragEvent) {
    e.preventDefault()
    const newFiles = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
    }))
    setBulkFiles((prev) => [...prev, ...newFiles])
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">Panel de Administracion</h1>
          <p className="text-sm text-muted-foreground">Vista general del sistema y metricas clave.</p>
        </div>
        {/* RF-19: Admin role badge - logistics only */}
        <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
          <Shield size={12} className="mr-1" />
          Rol: Administrativo (Gestion Logistica)
        </Badge>
      </div>

      {/* RF-19: Restricted access notice */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Shield size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Vista logistica - Sin acceso a contenido juridico</p>
          <p className="text-xs text-muted-foreground">
            Como personal administrativo, puede gestionar usuarios, reasignar casos y ver metricas agregadas.
            El contenido juridico de los expedientes es visible unicamente para estudiantes y profesores asignados.
          </p>
        </div>
      </div>

      {/* RF-13: KPI Cards - now 6 cards in 3x2 grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-border shadow-card card-hover">
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} aria-hidden="true" />
                </div>
                {kpi.change && (
                  <span
                    className={`flex items-center gap-1 text-xs font-medium ${
                      kpi.change === "Vencido" ? "text-destructive" : "text-success"
                    }`}
                  >
                    {kpi.change === "Vencido" ? (
                      <AlertCircle size={12} aria-hidden="true" />
                    ) : (
                      <TrendingUp size={12} aria-hidden="true" />
                    )}
                    {kpi.change}
                  </span>
                )}
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground">{kpi.value}</span>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                {kpi.changeLabel && (
                  <p className="text-xs text-muted-foreground">{kpi.changeLabel}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="border-border lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Casos por Area Juridica</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ cases: { label: "Casos", color: "#030568" } }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={casesByArea} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 88%)" />
                  <XAxis dataKey="area" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cases" radius={[4, 4, 0, 0]}>
                    {casesByArea.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Casos por Fase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={casesByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {casesByStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, ""]}
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid hsl(214 20% 88%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => (
                      <span style={{ color: "#1e1e3a", fontSize: "12px" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complete Case List Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Todos los Casos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Buscar radicado, estudiante, profesor, No. documento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9"
                aria-label="Buscar casos"
              />
            </div>
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las areas</SelectItem>
                {uniqueAreas.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPhase} onValueChange={setFilterPhase}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fases</SelectItem>
                <SelectItem value="1">Fase 1 - Evaluacion</SelectItem>
                <SelectItem value="2">Fase 2 - Revision</SelectItem>
                <SelectItem value="3">Fase 3 - Aprobacion</SelectItem>
                <SelectItem value="4">Fase 4 - Seguimiento</SelectItem>
                <SelectItem value="5">Cerrado</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {filteredCases.length} caso(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Radicado</TableHead>
                  <TableHead className="hidden sm:table-cell">Fase</TableHead>
                  <TableHead className="hidden md:table-cell">Area</TableHead>
                  <TableHead className="hidden lg:table-cell">Profesor</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha Inicio</TableHead>
                  <TableHead className="hidden sm:table-cell">Horas</TableHead>
                  <TableHead className="w-24">
                    <span className="sr-only">Accion</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex flex-col items-center gap-0.5">
                        <Semaphore color={getSemaphoreFromDeadline(c.deadline)} size="sm" />
                        <span className={`text-[9px] font-semibold ${
                          getSemaphoreFromDeadline(c.deadline) === "red" ? "text-destructive" :
                          getSemaphoreFromDeadline(c.deadline) === "yellow" ? "text-amber-600" :
                          "text-success"
                        }`}>
                          {getSemaphoreLabel(getSemaphoreFromDeadline(c.deadline))}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-foreground">{c.radicado}</span>
                      {c.highRiskAlert && (
                        <Badge className="ml-2 hidden sm:inline-flex bg-destructive/10 text-destructive text-xs px-1">
                          Riesgo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className={`text-xs ${phaseBadge[getPhaseFromStatus(c.status)] || ""}`}>
                        Fase {getPhaseFromStatus(c.status)} - {PHASE_LABELS[getPhaseFromStatus(c.status)]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{c.area}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-foreground">{c.assignedProfessor}</TableCell>
                    <TableCell className="text-sm text-foreground">{c.assignedStudent}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{c.createdAt}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-foreground">{c.hoursSpent}h</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-transparent"
                        onClick={() => {
                          setReassignCase(c.radicado)
                          setShowReassignDialog(true)
                        }}
                      >
                        <ArrowRightLeft size={12} className="mr-1" />
                        <span className="hidden sm:inline">Reasignar</span>
                        <span className="sm:hidden">R</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No se encontraron casos con estos filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tables Row: Critical Cases + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Critical Cases */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <AlertCircle size={18} className="text-destructive" aria-hidden="true" />
              Casos Vencidos
            </CardTitle>
            <Badge variant="destructive">{mockCases.filter((c) => getSemaphoreFromDeadline(c.deadline) === "red").length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Radicado</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead className="hidden sm:table-cell">Estudiante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCases
                    .filter((c) => getSemaphoreFromDeadline(c.deadline) === "red")
                    .map((c) => {
                      const daysOverdue = Math.max(0, Math.ceil((TODAY.getTime() - new Date(c.deadline).getTime()) / 86400000))
                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Semaphore color="red" size="sm" />
                              <span className="font-mono text-sm text-foreground">{c.radicado}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-destructive">Vencido</span>
                              <span className="text-[10px] text-destructive/80">{daysOverdue} dia(s)</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-foreground">{c.assignedStudent}</TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Clock size={18} className="text-secondary" aria-hidden="true" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <UserCircle size={16} className="text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RF-19: Users section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Users size={18} aria-hidden="true" />
            Usuarios del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="hidden sm:table-cell">Area</TableHead>
                  <TableHead>Casos</TableHead>
                  <TableHead className="hidden md:table-cell">Correo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          user.role === "profesor"
                            ? "bg-primary/10 text-primary"
                            : user.role === "estudiante"
                              ? "bg-secondary/10 text-secondary"
                              : "bg-accent/10 text-accent-foreground"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{user.area || "N/A"}</TableCell>
                    <TableCell className="text-foreground">{user.activeCases}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{user.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {/* RF-06: Assign cases to professors */}
        <Dialog open={showAssignDialog} onOpenChange={(open) => {
          setShowAssignDialog(open)
          if (!open) {
            setAssignCaseSearch("")
            setAssignProfSearch("")
            setAssignSelectedCase("")
            setAssignSelectedProf("")
            setAssignCaseDropdownOpen(false)
            setAssignProfDropdownOpen(false)
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <ArrowUpRight size={16} aria-hidden="true" />
              Asignar caso a profesor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Asignar Caso a Profesor</DialogTitle>
              <DialogDescription>
                Seleccione el caso y el profesor segun su especialidad juridica. El sistema asigna automaticamente por area.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              {/* Case Search - Dropdown */}
              <div className="flex flex-col gap-2">
                <Label>Caso pendiente de asignacion</Label>
                <button
                  type="button"
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
                  onClick={() => { setAssignCaseDropdownOpen(!assignCaseDropdownOpen); setAssignProfDropdownOpen(false) }}
                >
                  {assignSelectedCase ? (
                    <span className="text-foreground">
                      {(() => { const c = mockCases.find((c) => c.id === assignSelectedCase); return c ? `${c.radicado} - ${c.area}` : "Seleccionar" })()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Seleccionar caso pendiente...</span>
                  )}
                  <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${assignCaseDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {assignCaseDropdownOpen && (
                  <div className="flex flex-col gap-1 rounded-lg border border-border bg-card shadow-lg">
                    <div className="relative p-2 border-b border-border">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <Input
                        placeholder="Buscar por radicado, cliente, area o documento..."
                        value={assignCaseSearch}
                        onChange={(e) => setAssignCaseSearch(e.target.value)}
                        className="h-8 pl-8 text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-36 overflow-y-auto">
                      {(() => {
                        const q = assignCaseSearch.toLowerCase()
                        const pendingCases = mockCases
                          .filter((c) => c.status === "Evaluacion")
                          .filter((c) =>
                            !q ||
                            c.radicado.toLowerCase().includes(q) ||
                            c.clientName.toLowerCase().includes(q) ||
                            c.area.toLowerCase().includes(q) ||
                            c.clientDoc.includes(assignCaseSearch) ||
                            c.type.toLowerCase().includes(q)
                          )
                        if (pendingCases.length === 0) {
                          return <p className="py-3 text-center text-xs text-muted-foreground">No se encontraron casos pendientes.</p>
                        }
                        return pendingCases.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 ${
                              assignSelectedCase === c.id ? "bg-primary/10 font-medium" : ""
                            }`}
                            onClick={() => {
                              setAssignSelectedCase(c.id)
                              setAssignCaseDropdownOpen(false)
                              setAssignCaseSearch("")
                            }}
                          >
                            <div className="flex flex-1 flex-col">
                              <span className="font-mono text-xs text-foreground">{c.radicado}</span>
                              <span className="text-xs text-muted-foreground">{c.clientName} · {c.area} · {c.type}</span>
                            </div>
                            {assignSelectedCase === c.id && (
                              <CheckCircle2 size={14} className="shrink-0 text-success" />
                            )}
                          </button>
                        ))
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Professor Search - Dropdown */}
              <div className="flex flex-col gap-2">
                <Label>Profesor (por especialidad)</Label>
                <button
                  type="button"
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
                  onClick={() => { setAssignProfDropdownOpen(!assignProfDropdownOpen); setAssignCaseDropdownOpen(false) }}
                >
                  {assignSelectedProf ? (
                    <span className="text-foreground">
                      {(() => { const u = mockUsers.find((u) => u.id === assignSelectedProf); return u ? `${u.name} - ${u.area || "Sin area"}` : "Seleccionar" })()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Seleccionar profesor...</span>
                  )}
                  <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${assignProfDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {assignProfDropdownOpen && (
                  <div className="flex flex-col gap-1 rounded-lg border border-border bg-card shadow-lg">
                    <div className="relative p-2 border-b border-border">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <Input
                        placeholder="Buscar por nombre, area o correo..."
                        value={assignProfSearch}
                        onChange={(e) => setAssignProfSearch(e.target.value)}
                        className="h-8 pl-8 text-sm"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-36 overflow-y-auto">
                      {(() => {
                        const q = assignProfSearch.toLowerCase()
                        const professors = mockUsers
                          .filter((u) => u.role === "profesor")
                          .filter((u) =>
                            !q ||
                            u.name.toLowerCase().includes(q) ||
                            (u.area && u.area.toLowerCase().includes(q)) ||
                            u.email.toLowerCase().includes(q) ||
                            (u.docNumber && u.docNumber.includes(assignProfSearch))
                          )
                        if (professors.length === 0) {
                          return <p className="py-3 text-center text-xs text-muted-foreground">No se encontraron profesores.</p>
                        }
                        return professors.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 ${
                              assignSelectedProf === u.id ? "bg-primary/10 font-medium" : ""
                            }`}
                            onClick={() => {
                              setAssignSelectedProf(u.id)
                              setAssignProfDropdownOpen(false)
                              setAssignProfSearch("")
                            }}
                          >
                            <div className="flex flex-1 flex-col">
                              <span className="text-foreground">{u.name}</span>
                              <span className="text-xs text-muted-foreground">{u.area || "Sin area"} · {u.activeCases} caso(s) activos</span>
                            </div>
                            {assignSelectedProf === u.id && (
                              <CheckCircle2 size={14} className="shrink-0 text-success" />
                            )}
                          </button>
                        ))
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-assignment note */}
              <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <Shield size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-xs text-foreground">
                  El sistema sugiere profesores segun la especialidad juridica del caso. Puede asignar manualmente si lo requiere.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancelar</Button>
              <Button onClick={() => setShowAssignDialog(false)} disabled={!assignSelectedCase || !assignSelectedProf}>Asignar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* RF-24: Bulk upload */}
        <Dialog open={showBulkUploadDialog} onOpenChange={setShowBulkUploadDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Upload size={16} aria-hidden="true" />
              Carga masiva de documentos
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Carga Masiva de Documentos</DialogTitle>
              <DialogDescription>
                Cargue expedientes historicos de anos anteriores. Los archivos seran procesados en segundo plano.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div
                className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleBulkDrop}
                role="button"
                tabIndex={0}
                aria-label="Area de carga masiva de archivos"
              >
                <Upload size={28} className="text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-foreground">Arrastra archivos o carpetas aqui</p>
                <p className="text-xs text-muted-foreground">PDF, DOCX, JPG, PNG - Sin limite</p>
              </div>
              {bulkFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {bulkFiles.length} archivo(s) listos
                  </span>
                  <div className="max-h-32 overflow-y-auto">
                    {bulkFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-muted-foreground" />
                          <span className="text-xs text-foreground">{f.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setBulkFiles((prev) => prev.filter((_, j) => j !== i))}
                          aria-label={`Eliminar ${f.name}`}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkUploadDialog(false)}>Cancelar</Button>
              <Button onClick={() => setShowBulkUploadDialog(false)} disabled={bulkFiles.length === 0}>
                Iniciar carga ({bulkFiles.length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          Generar reporte mensual
        </Button>
      </div>

      {/* RF-25: Reassignment Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={(open) => {
        setShowReassignDialog(open)
        if (!open) {
          setReassignStudentSearch("")
          setReassignSelectedStudent("")
          setReassignDropdownOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reasignar / Sustituir Caso</DialogTitle>
            <DialogDescription>
              Caso: <span className="font-mono font-semibold">{reassignCase}</span>. Toda la
              trazabilidad sera transferida al nuevo estudiante.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Nuevo estudiante asignado</Label>
              {/* Selected student display / dropdown trigger */}
              <button
                type="button"
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
                onClick={() => setReassignDropdownOpen(!reassignDropdownOpen)}
              >
                {reassignSelectedStudent ? (
                  <span className="text-foreground">
                    {mockUsers.find((u) => u.id === reassignSelectedStudent)?.name || "Seleccionar"}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({mockUsers.find((u) => u.id === reassignSelectedStudent)?.docType}{" "}
                      {mockUsers.find((u) => u.id === reassignSelectedStudent)?.docNumber})
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Seleccionar estudiante...</span>
                )}
                <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${reassignDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {reassignDropdownOpen && (
                <div className="flex flex-col gap-1 rounded-lg border border-border bg-card shadow-lg">
                  <div className="relative p-2 border-b border-border">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                      placeholder="Buscar por nombre, correo o No. documento..."
                      value={reassignStudentSearch}
                      onChange={(e) => setReassignStudentSearch(e.target.value)}
                      className="h-8 pl-8 text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {(() => {
                      const q = reassignStudentSearch.toLowerCase()
                      const studentUsers = mockUsers
                        .filter((u) => u.role === "estudiante")
                        .filter((u) =>
                          !q ||
                          u.name.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          (u.docNumber && u.docNumber.includes(reassignStudentSearch)) ||
                          (u.docType && u.docType.toLowerCase().includes(q))
                        )
                      if (studentUsers.length === 0) {
                        return <p className="py-3 text-center text-xs text-muted-foreground">No se encontraron estudiantes.</p>
                      }
                      return studentUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 ${
                            reassignSelectedStudent === u.id ? "bg-primary/10 font-medium" : ""
                          }`}
                          onClick={() => {
                            setReassignSelectedStudent(u.id)
                            setReassignDropdownOpen(false)
                            setReassignStudentSearch("")
                          }}
                        >
                          <div className="flex flex-1 flex-col">
                            <span className="text-foreground">{u.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {u.docType} {u.docNumber} · {u.email} · {u.activeCases} caso(s)
                            </span>
                          </div>
                          {reassignSelectedStudent === u.id && (
                            <CheckCircle2 size={14} className="shrink-0 text-success" />
                          )}
                        </button>
                      ))
                    })()}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reassignReason">Motivo de la reasignacion</Label>
              <Textarea
                id="reassignReason"
                placeholder="Ej: Retiro del estudiante, incapacidad medica..."
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/10 px-3 py-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <p className="text-xs text-foreground">
                La reasignacion quedara registrada en el historial de auditoria del expediente.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReassignDialog(false)}>Cancelar</Button>
            <Button onClick={() => setShowReassignDialog(false)} disabled={!reassignSelectedStudent}>Confirmar reasignacion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
