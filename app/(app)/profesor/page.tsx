"use client"

import { useState, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Search,
  CheckCircle2,
  Filter,
  AlertTriangle,
  ShieldAlert,
  FileSearch,
  Eye,
  Activity,
  Lock,
  Inbox,
  Clock,
  ArrowRight,
  User,
  Scale,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Semaphore } from "@/components/semaphore"
import { mockProfessorInbox, type ProfessorInboxItem } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"

const phaseLabels: Record<number, { label: string; shortLabel: string; color: string; bg: string; border: string; icon: typeof FileSearch; desc: string }> = {
  1: { label: "Evaluacion", shortLabel: "Evaluacion", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: FileSearch, desc: "Revise la informacion enviada por el estudiante." },
  2: { label: "Revision", shortLabel: "Revision", color: "text-secondary", bg: "bg-secondary/5", border: "border-secondary/20", icon: Eye, desc: "Apruebe o devuelva con observaciones." },
  3: { label: "Aprobacion", shortLabel: "Aprobacion", color: "text-success", bg: "bg-success/5", border: "border-success/20", icon: CheckCircle2, desc: "Caso aprobado - Visto Bueno final." },
  4: { label: "Seguimiento", shortLabel: "Seguimiento", color: "text-primary", bg: "bg-primary/5", border: "border-primary/20", icon: Activity, desc: "Monitoreo continuo del caso." },
  5: { label: "Cerrado", shortLabel: "Cerrado", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-muted", icon: Lock, desc: "Casos cerrados definitivamente." },
}

function ProfessorInboxContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const faseParam = searchParams.get("fase")

  const professorArea = user?.area || "Laboral"

  const [items] = useState<ProfessorInboxItem[]>(mockProfessorInbox)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [filterRedOnly, setFilterRedOnly] = useState(false)

  const phaseCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    mockProfessorInbox.forEach((item) => {
      counts[item.phase]++
    })
    return counts
  }, [])

  const totalCases = useMemo(() => mockProfessorInbox.length, [])
  const urgentCases = useMemo(() => mockProfessorInbox.filter((i) => i.semaphore === "red").length, [])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      item.from.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.radicado.toLowerCase().includes(q) ||
      (item.clientDoc && item.clientDoc.includes(search))
    const matchRed = filterRedOnly ? item.semaphore === "red" : true
    const matchPhase = !faseParam || item.phase === Number(faseParam)
    return matchSearch && matchRed && matchPhase
  })

  function toggleSelectAll() {
    if (selected.size === filteredItems.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredItems.map((i) => i.id)))
    }
  }

  const highRiskCount = filteredItems.filter((i) => i.highRisk).length
  const currentPhase = faseParam ? Number(faseParam) as 1 | 2 | 3 | 4 | 5 : null
  const phaseInfo = currentPhase ? phaseLabels[currentPhase] : null

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#030568] via-[#050a8e] to-[#0a1199] p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-300/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/[0.03] blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <Scale size={22} className="text-amber-300" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {phaseInfo ? `Fase ${currentPhase} - ${phaseInfo.label}` : "Bandeja de Entrada"}
                </h1>
                <p className="text-sm text-white/50">
                  {phaseInfo ? phaseInfo.desc : "Todos los casos asignados a su revision"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-4 py-2.5 backdrop-blur-sm">
              <Inbox size={16} className="text-amber-300" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-tight">{totalCases}</span>
                <span className="text-[10px] text-white/50 uppercase tracking-wide">Casos</span>
              </div>
            </div>
            {urgentCases > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/20 border border-red-400/20 px-4 py-2.5 backdrop-blur-sm">
                <AlertTriangle size={16} className="text-red-300" />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-red-200 leading-tight">{urgentCases}</span>
                  <span className="text-[10px] text-red-300/60 uppercase tracking-wide">Urgentes</span>
                </div>
              </div>
            )}
            <Badge className="hidden sm:flex bg-white/10 text-white/80 border border-white/10 backdrop-blur-sm">
              <ShieldAlert size={12} className="mr-1.5 text-amber-300" />
              {professorArea}
            </Badge>
          </div>
        </div>
      </div>

      {/* Phase Counter Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {([1, 2, 3, 4, 5] as const).map((phase) => {
          const info = phaseLabels[phase]
          const isActive = currentPhase === phase
          const count = phaseCounts[phase]
          return (
            <Link key={phase} href={isActive ? "/profesor" : `/profesor?fase=${phase}`}>
              <Card className={`group cursor-pointer transition-all duration-200 hover:shadow-md ${
                isActive
                  ? `ring-2 ring-primary shadow-md ${info.bg} ${info.border}`
                  : "border-border hover:border-primary/30"
              }`}>
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                      isActive ? `${info.bg} ${info.color}` : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                    }`}>
                      <info.icon size={18} />
                    </div>
                    <span className={`text-2xl font-bold tabular-nums ${isActive ? info.color : "text-foreground"}`}>
                      {count}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium truncate ${isActive ? info.color : "text-foreground"}`}>
                      {info.shortLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Fase {phase}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Buscar por estudiante, radicado o asunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 rounded-xl"
            aria-label="Buscar en bandeja de entrada"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filterRedOnly ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilterRedOnly(!filterRedOnly)}
            className={`flex items-center gap-2 rounded-lg ${!filterRedOnly ? "bg-transparent" : ""}`}
          >
            <Filter size={14} aria-hidden="true" />
            Urgentes
          </Button>
          {currentPhase && (
            <Button variant="ghost" size="sm" asChild className="rounded-lg">
              <Link href="/profesor">Ver todos</Link>
            </Button>
          )}
          {selected.size > 0 && (
            <Button size="sm" className="flex items-center gap-2 bg-success text-success-foreground hover:bg-success/90 rounded-lg">
              <CheckCircle2 size={14} aria-hidden="true" />
              Aprobar ({selected.size})
            </Button>
          )}
        </div>
      </div>

      {/* Risk Alert Banner */}
      {highRiskCount > 0 && !filterRedOnly && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <AlertTriangle size={18} className="shrink-0 text-destructive" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{highRiskCount} caso(s) de Riesgo Alto</span>
            <span className="text-muted-foreground ml-1">requieren atencion prioritaria</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={() => setFilterRedOnly(true)}
          >
            Ver urgentes
          </Button>
        </div>
      )}

      {/* Inbox List */}
      <Card className="border-border rounded-xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          {/* Select All Bar */}
          <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-2.5">
            <Checkbox
              checked={selected.size === filteredItems.length && filteredItems.length > 0}
              onCheckedChange={toggleSelectAll}
              aria-label="Seleccionar todos"
            />
            <span className="text-sm text-muted-foreground">
              {selected.size > 0
                ? `${selected.size} seleccionado(s)`
                : `${filteredItems.length} caso(s)`}
            </span>
          </div>

          {/* Inbox Items */}
          <div className="divide-y divide-border" role="list">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Inbox size={24} />
                </div>
                <p className="text-base font-medium text-foreground">Sin resultados</p>
                <p className="text-sm">No hay casos {currentPhase ? `en Fase ${currentPhase}` : ""} con estos filtros.</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const pInfo = phaseLabels[item.phase]
                return (
                  <Link
                    key={item.id}
                    href={`/profesor/revisar/${item.caseId}`}
                    className={`group flex items-center gap-3 px-4 py-4 transition-all hover:bg-primary/[0.03] ${
                      !item.read ? "bg-card" : "bg-muted/10"
                    }`}
                    role="listitem"
                  >
                    <Checkbox
                      checked={selected.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                      aria-label={`Seleccionar caso de ${item.from}`}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <Semaphore color={item.semaphore} size="sm" />

                    {/* Avatar */}
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase">
                      {item.from.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm truncate ${!item.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                          {item.from}
                        </span>
                        {item.highRisk && (
                          <AlertTriangle size={14} className="shrink-0 text-destructive" aria-label="Riesgo alto" />
                        )}
                        {!item.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`truncate text-sm ${!item.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {item.subject}
                        </span>
                        <span className="hidden lg:inline text-xs text-muted-foreground truncate">
                          — {item.preview}
                        </span>
                      </div>
                    </div>

                    {/* Badges & Meta */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px] bg-muted/80 text-muted-foreground">
                        {item.area}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${pInfo?.bg || ""} ${pInfo?.color || ""} ${pInfo?.border || ""} border`}
                      >
                        {item.phase === 5 ? (
                          <><Lock size={10} className="mr-1" />Cerrado</>
                        ) : (
                          <>F{item.phase}</>
                        )}
                      </Badge>
                    </div>

                    {/* Date & Arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden lg:inline text-xs text-muted-foreground whitespace-nowrap">
                        {item.date}
                      </span>
                      <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfessorInboxPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Cargando...</div>}>
      <ProfessorInboxContent />
    </Suspense>
  )
}
