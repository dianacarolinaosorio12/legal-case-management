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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Semaphore } from "@/components/semaphore"
import { mockProfessorInbox, type ProfessorInboxItem } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"

const phaseLabels: Record<number, { label: string; color: string; icon: typeof FileSearch; desc: string }> = {
  1: { label: "Evaluacion del Caso", color: "bg-muted text-muted-foreground", icon: FileSearch, desc: "Revise los archivos e informacion clave enviados por el estudiante." },
  2: { label: "Revision", color: "bg-secondary/15 text-secondary", icon: Eye, desc: "Revise y apruebe o devuelva el caso con observaciones." },
  3: { label: "Aprobacion", color: "bg-success/15 text-success", icon: CheckCircle2, desc: "El caso esta aprobado. Verifique el Visto Bueno final." },
  4: { label: "Seguimiento", color: "bg-primary/15 text-primary", icon: Activity, desc: "Monitoreo continuo del caso en curso." },
  5: { label: "Cerrado", color: "bg-muted text-muted-foreground", icon: CheckCircle2, desc: "Casos cerrados definitivamente por el profesor." },
}

function ProfessorInboxContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const faseParam = searchParams.get("fase")

  const professorArea = user?.area || "Laboral"

  // Show ALL inbox items so every phase has examples
  const [items] = useState<ProfessorInboxItem[]>(mockProfessorInbox)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [filterRedOnly, setFilterRedOnly] = useState(false)

  // Phase counts from all items
  const phaseCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    mockProfessorInbox.forEach((item) => {
      counts[item.phase]++
    })
    return counts
  }, [])

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
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">
            {phaseInfo ? `Fase ${currentPhase} - ${phaseInfo.label}` : "Bandeja de Entrada"}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary w-fit">
              <ShieldAlert size={12} className="mr-1" aria-hidden="true" />
              Area: {professorArea}
            </Badge>
            {phaseInfo && (
              <span className="text-xs text-muted-foreground">{phaseInfo.desc}</span>
            )}
            {!phaseInfo && (
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Todos los casos asignados
              </span>
            )}
          </div>
        </div>
        {highRiskCount > 0 && (
          <Badge className="bg-destructive/15 text-destructive w-fit">
            <AlertTriangle size={12} className="mr-1" />
            {highRiskCount} caso(s) de Riesgo Alto
          </Badge>
        )}
      </div>

      {/* Phase Counter Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {([1, 2, 3, 4, 5] as const).map((phase) => {
          const info = phaseLabels[phase]
          const isActive = currentPhase === phase
          return (
            <Link key={phase} href={isActive ? "/profesor" : `/profesor?fase=${phase}`}>
              <Card className={`border-border card-hover cursor-pointer transition-all ${isActive ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="flex flex-col gap-1 p-4">
                  <div className="flex items-center justify-between">
                    <info.icon size={16} className="text-muted-foreground" />
                    <span className="text-2xl font-bold text-foreground">{phaseCounts[phase]}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Fase {phase}</span>
                  <span className="text-xs font-medium text-foreground truncate">{info.label}</span>
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
            placeholder="Buscar por estudiante, radicado, documento o asunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9"
            aria-label="Buscar en bandeja de entrada"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filterRedOnly ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilterRedOnly(!filterRedOnly)}
            className={`flex items-center gap-2 ${!filterRedOnly ? "bg-transparent" : ""}`}
          >
            <Filter size={14} aria-hidden="true" />
            Urgentes
          </Button>
          {currentPhase && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profesor">Ver todos</Link>
            </Button>
          )}
          {selected.size > 0 && (
            <Button size="sm" className="flex items-center gap-2 bg-success text-success-foreground hover:bg-success/90">
              <CheckCircle2 size={14} aria-hidden="true" />
              Aprobar ({selected.size})
            </Button>
          )}
        </div>
      </div>

      {/* Inbox List */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b border-border px-4 py-2">
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

          <div className="divide-y divide-border" role="list">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <p className="text-base">No hay casos {currentPhase ? `en Fase ${currentPhase}` : ""} con estos filtros.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/profesor/revisar/${item.caseId}`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
                    !item.read ? "bg-card font-medium" : "bg-muted/20"
                  }`}
                  role="listitem"
                >
                  <Checkbox
                    checked={selected.has(item.id)}
                    onCheckedChange={() => toggleSelect(item.id)}
                    aria-label={`Seleccionar caso de ${item.from}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {item.highRisk && (
                    <AlertTriangle size={16} className="shrink-0 text-destructive" aria-label="Riesgo alto" />
                  )}
                  <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <span className="w-36 shrink-0 truncate text-sm text-foreground">
                      {item.from}
                    </span>
                    <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                      <span className="truncate text-sm text-foreground">{item.subject}</span>
                      <span className="hidden truncate text-xs text-muted-foreground lg:inline">
                        {item.preview}
                      </span>
                    </div>
                    <div className="hidden shrink-0 gap-2 sm:flex">
                      <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                        {item.area}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 ${phaseLabels[item.phase]?.color || ""}`}
                      >
                        {item.phase === 5 ? (
                          <><Lock size={10} className="mr-1" />Cerrado</>
                        ) : (
                          `Fase ${item.phase}`
                        )}
                      </Badge>
                    </div>
                  </div>
                  <Semaphore color={item.semaphore} size="sm" />
                  <span className="hidden shrink-0 text-xs text-muted-foreground lg:inline">
                    {item.date}
                  </span>
                </Link>
              ))
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
