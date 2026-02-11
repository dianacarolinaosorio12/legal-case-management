"use client"

import { useState, useMemo } from "react"
import {
  Shield,
  Search,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowRightLeft,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Semaphore } from "@/components/semaphore"
import { mockCases, type AuditEntry, type UserRole } from "@/lib/mock-data"

// Aggregate all audit entries from all cases
interface AuditWithCase extends AuditEntry {
  caseRadicado: string
  caseId: string
  caseSemaphore: "red" | "yellow" | "green"
  caseClientDoc: string
}

const roleColors: Record<string, string> = {
  estudiante: "bg-secondary/10 text-secondary",
  profesor: "bg-primary/10 text-primary",
  administrativo: "bg-accent/10 text-accent-foreground",
  IA: "bg-muted text-muted-foreground",
}

const roleIcons: Record<string, typeof User> = {
  estudiante: User,
  profesor: Shield,
  administrativo: FileText,
  IA: Clock,
}

export default function AdminAuditPage() {
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterCase, setFilterCase] = useState("all")

  // Build combined audit log from all cases
  const allAuditEntries: AuditWithCase[] = useMemo(() => {
    return mockCases.flatMap((c) =>
      c.auditLog.map((entry) => ({
        ...entry,
        caseRadicado: c.radicado,
        caseId: c.id,
        caseSemaphore: c.semaphore,
        caseClientDoc: c.clientDoc,
      }))
    ).sort((a, b) => {
      // Sort by date descending (most recent first)
      // Parse dates like "15 Ene 2026" for comparison
      return b.id.localeCompare(a.id)
    })
  }, [])

  const filteredEntries = useMemo(() => {
    return allAuditEntries.filter((entry) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        entry.user.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.caseRadicado.toLowerCase().includes(q) ||
        entry.caseClientDoc.includes(search) ||
        (entry.detail && entry.detail.toLowerCase().includes(q))
      const matchRole = filterRole === "all" || entry.role === filterRole
      const matchCase = filterCase === "all" || entry.caseId === filterCase
      return matchSearch && matchRole && matchCase
    })
  }, [allAuditEntries, search, filterRole, filterCase])

  // Stats
  const totalEntries = allAuditEntries.length
  const studentActions = allAuditEntries.filter((e) => e.role === "estudiante").length
  const professorActions = allAuditEntries.filter((e) => e.role === "profesor").length
  const adminActions = allAuditEntries.filter((e) => e.role === "administrativo").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">
          Auditoria de Casos
        </h1>
        <p className="text-sm text-muted-foreground">
          Trazabilidad completa de todas las acciones realizadas en el sistema.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield size={18} className="text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">{totalEntries}</span>
              <p className="text-xs text-muted-foreground">Total acciones</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <User size={18} className="text-secondary" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">{studentActions}</span>
              <p className="text-xs text-muted-foreground">Estudiantes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield size={18} className="text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">{professorActions}</span>
              <p className="text-xs text-muted-foreground">Profesores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <ArrowRightLeft size={18} className="text-accent-foreground" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">{adminActions}</span>
              <p className="text-xs text-muted-foreground">Administrativo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuario, accion, radicado, No. documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="estudiante">Estudiante</SelectItem>
              <SelectItem value="profesor">Profesor</SelectItem>
              <SelectItem value="administrativo">Administrativo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCase} onValueChange={setFilterCase}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Caso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los casos</SelectItem>
              {mockCases.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.radicado}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(search || filterRole !== "all" || filterCase !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setFilterRole("all"); setFilterCase("all") }}
            >
              Limpiar
            </Button>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">{filteredEntries.length} registro(s) encontrado(s)</p>

      {/* Audit Timeline */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Shield size={18} />
            Registro de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Filter size={32} />
              <p>No hay registros con estos filtros.</p>
            </div>
          ) : (
            <div className="relative flex flex-col gap-0">
              {filteredEntries.map((entry, i) => {
                const RoleIcon = roleIcons[entry.role] || Clock
                const isApproval = entry.action.toLowerCase().includes("aprob")
                const isSubstitution = entry.action.toLowerCase().includes("sustitucion")
                const isRisk = entry.action.toLowerCase().includes("riesgo")
                return (
                  <div key={`${entry.caseId}-${entry.id}`} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < filteredEntries.length - 1 && (
                      <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
                    )}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${roleColors[entry.role] || "bg-muted"}`}
                    >
                      {isApproval ? (
                        <CheckCircle2 size={14} className="text-success" />
                      ) : isRisk ? (
                        <AlertTriangle size={14} className="text-destructive" />
                      ) : isSubstitution ? (
                        <ArrowRightLeft size={14} />
                      ) : (
                        <RoleIcon size={14} />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{entry.user}</span>
                        <Badge variant="secondary" className={`text-xs ${roleColors[entry.role] || ""}`}>
                          {entry.role === "IA" ? "IA" : entry.role}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          <Semaphore color={entry.caseSemaphore} size="sm" />
                          <span className="font-mono text-xs text-muted-foreground">{entry.caseRadicado}</span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">{entry.action}</p>
                      {entry.detail && (
                        <p className="text-xs text-muted-foreground">{entry.detail}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{entry.date}, {entry.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
