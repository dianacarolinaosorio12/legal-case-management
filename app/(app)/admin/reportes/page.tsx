"use client"

import { useState } from "react"
import {
  FileBarChart,
  Clock,
  Users,
  AlertTriangle,
  ThumbsUp,
  Shield,
  FileDown,
  FileSpreadsheet,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockCases, mockUsers } from "@/lib/mock-data"

// ── Period selector constants ────────────────────────────────────────
const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]

const YEARS = ["2024", "2025", "2026"]

// ── Quick stats computed from mock data ─────────────────────────────
const totalCases = mockCases.length
const activeCases = mockCases.filter((c) => c.status !== "Cerrado").length
const totalPracticeHours = mockUsers
  .filter((u) => u.role === "estudiante")
  .reduce((acc, u) => acc + u.activeCases * 12, 0) // 12 hours estimated per active case
const satisfactionAvg =
  mockCases.filter((c) => c.survey).length > 0
    ? (
        (mockCases.filter((c) => c.survey?.rating === "satisfecho").length /
          mockCases.filter((c) => c.survey).length) *
        5
      ).toFixed(1)
    : "4.5"

const quickStats = [
  {
    label: "Total casos",
    value: String(totalCases),
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Casos activos",
    value: String(activeCases),
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    label: "Horas totales practicas",
    value: String(totalPracticeHours),
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "Promedio satisfaccion",
    value: `${satisfactionAvg}/5`,
    color: "text-accent-foreground",
    bg: "bg-accent/20",
  },
]

// ── Report definitions ──────────────────────────────────────────────
const reports = [
  {
    id: "casos",
    title: "Reporte de Casos",
    description: "Resumen de todos los casos, estados y areas juridicas",
    icon: FileBarChart,
    color: "text-primary",
    bg: "bg-primary/10",
    filename: "reporte_casos",
  },
  {
    id: "practicas",
    title: "Reporte de Practicas",
    description: "Horas de practica por estudiante y semestre",
    icon: Clock,
    color: "text-secondary",
    bg: "bg-secondary/10",
    filename: "reporte_practicas",
  },
  {
    id: "productividad",
    title: "Reporte de Productividad",
    description: "Casos atendidos por profesor y area",
    icon: Users,
    color: "text-success",
    bg: "bg-success/10",
    filename: "reporte_productividad",
  },
  {
    id: "semaforo",
    title: "Reporte de Semaforo",
    description: "Estado de urgencia de todos los casos activos",
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    filename: "reporte_semaforo",
  },
  {
    id: "satisfaccion",
    title: "Reporte de Satisfaccion",
    description: "Resultados de encuestas de satisfaccion",
    icon: ThumbsUp,
    color: "text-chart-4",
    bg: "bg-success/10",
    filename: "reporte_satisfaccion",
  },
  {
    id: "auditoria",
    title: "Auditoria General",
    description: "Registro completo de acciones del sistema",
    icon: Shield,
    color: "text-destructive",
    bg: "bg-destructive/10",
    filename: "auditoria_general",
  },
]

export default function ReportesPage() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState<"mensual" | "anual">("mensual")
  const [selectedMonth, setSelectedMonth] = useState("02")
  const [selectedYear, setSelectedYear] = useState("2026")

  const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label ?? ""
  const periodLabel =
    periodo === "mensual"
      ? `${monthLabel} ${selectedYear}`
      : `Ano ${selectedYear}`

  function handleDownload(filename: string, format: "pdf" | "xlsx") {
    const fullName = `${filename}.${format}`
    setDownloading(fullName)
    // Mock download: show alert and reset state after short delay
    setTimeout(() => {
      alert(`Descargando ${fullName}`)
      setDownloading(null)
    }, 600)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">
          Reportes y Estadisticas
        </h1>
        <p className="text-sm text-muted-foreground">
          Descargue reportes en PDF o Excel para analisis y seguimiento.
        </p>
      </div>

      {/* Period Selector */}
      <Card className="border-border shadow-card">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
          {/* Periodo type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Periodo</label>
            <Select
              value={periodo}
              onValueChange={(v: "mensual" | "anual") => setPeriodo(v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Seleccionar periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensual">Mensual</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Month selector — only when Mensual */}
          {periodo === "mensual" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Mes</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Year selector — always visible */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Ano</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Seleccionar ano" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Estadisticas &mdash; {periodLabel}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="border-border shadow-card card-hover">
            <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
              <span className={`text-2xl font-bold sm:text-3xl ${stat.color}`}>
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="border-border shadow-card card-hover flex flex-col"
          >
            <CardHeader className="flex flex-row items-start gap-3 pb-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${report.bg}`}
              >
                <report.icon className={`h-5 w-5 ${report.color}`} aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base text-foreground">
                  {report.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {report.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto flex flex-col gap-2 pt-0 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                className="flex flex-1 items-center justify-center gap-2 bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDownload(report.filename, "pdf")}
                disabled={downloading === `${report.filename}.pdf`}
              >
                <FileDown size={16} aria-hidden="true" />
                <span>
                  {downloading === `${report.filename}.pdf`
                    ? "Descargando..."
                    : "Descargar PDF"}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-1 items-center justify-center gap-2 bg-transparent text-success hover:bg-success/10 hover:text-success"
                onClick={() => handleDownload(report.filename, "xlsx")}
                disabled={downloading === `${report.filename}.xlsx`}
              >
                <FileSpreadsheet size={16} aria-hidden="true" />
                <span>
                  {downloading === `${report.filename}.xlsx`
                    ? "Descargando..."
                    : "Descargar Excel"}
                </span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <Download size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          Los reportes se generan con los datos mas recientes del sistema. Para reportes
          personalizados, contacte al administrador.
        </p>
      </div>
    </div>
  )
}
