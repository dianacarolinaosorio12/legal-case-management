"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import apiClient from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

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

const getSemaphoreFromDeadline = (deadline: string) => {
  const deadlineDate = new Date(deadline)
  const today = new Date()
  const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntil < 0) return "red"
  if (daysUntil <= 3) return "red"
  if (daysUntil <= 7) return "yellow"
  return "green"
}

const getPhaseFromStatus = (status: string) => {
  const phaseMap: Record<string, number> = {
    "Evaluacion": 1,
    "Sustanciacion": 2,
    "Revision del profesor": 3,
    "Aprobado": 4,
    "Seguimiento": 5,
    "Cerrado": 5,
  }
  return phaseMap[status] || 1
}

export default function MisCasosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [filterPhase, setFilterPhase] = useState("all")
  const [filterSemaphore, setFilterSemaphore] = useState("all")
  const [filterArea, setFilterArea] = useState("all")
  const [cases, setCases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const token = localStorage.getItem("sicop_token")
        if (!token) {
          router.push("/login")
          return
        }
        
        const data = await apiClient.cases.getAll()
        setCases(data as any[])
      } catch (err) {
        console.error("Error fetching cases:", err)
        setError("No se pudieron cargar los casos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCases()
  }, [router])

  // KPI stats
  const activeCases = cases.filter((c) => c.status !== "Cerrado").length
  const closedCases = cases.filter((c) => c.status === "Cerrado").length
  const inReview = cases.filter((c) => c.status === "Revision_del_profesor").length
  const redAlerts = cases.filter((c) => getSemaphoreFromDeadline(c.deadline) === "red")

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
      title: "En Revisión",
      value: inReview,
      icon: Clock,
      color: "text-secondary",
      bg: "bg-secondary/10",
      borderColor: "border-l-secondary",
    },
    {
      title: "Cerrados",
      value: closedCases,
      icon: AlertCircle,
      color: "text-muted-foreground",
      bg: "bg-muted",
      borderColor: "border-l-muted-foreground",
    },
    {
      title: "Alertas Rojas",
      value: redAlerts.length,
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      borderColor: "border-l-destructive",
    },
  ]

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        search === "" ||
        c.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        c.radicado?.toLowerCase().includes(search.toLowerCase())
      
      const phase = getPhaseFromStatus(c.status)
      const matchesPhase = filterPhase === "all" || phase === parseInt(filterPhase)
      
      const semaphore = getSemaphoreFromDeadline(c.deadline)
      const matchesSemaphore = filterSemaphore === "all" || semaphore === filterSemaphore
      
      const matchesArea = filterArea === "all" || c.area === filterArea

      return matchesSearch && matchesPhase && matchesSemaphore && matchesArea
    })
  }, [cases, search, filterPhase, filterSemaphore, filterArea])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando casos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Casos</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.name || "Usuario"}
          </p>
        </div>
        <Link href="/dashboard/nuevo-caso">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Caso
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`${stat.borderColor} border-l-4`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o radicado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterPhase} onValueChange={setFilterPhase}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fases</SelectItem>
                <SelectItem value="1">Evaluación</SelectItem>
                <SelectItem value="2">Sustanciación</SelectItem>
                <SelectItem value="3">Revisión</SelectItem>
                <SelectItem value="4">Seguimiento</SelectItem>
                <SelectItem value="5">Cerrado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSemaphore} onValueChange={setFilterSemaphore}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por semáforo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
                <SelectItem value="yellow">Amarillo</SelectItem>
                <SelectItem value="red">Rojo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
                <SelectItem value="Laboral">Laboral</SelectItem>
                <SelectItem value="Penal">Penal</SelectItem>
                <SelectItem value="Familia">Familia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Radicado</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Límite</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron casos
                </TableCell>
              </TableRow>
            ) : (
              filteredCases.map((legalCase) => (
                <TableRow key={legalCase.id}>
                  <TableCell className="font-medium">{legalCase.radicado}</TableCell>
                  <TableCell>{legalCase.clientName}</TableCell>
                  <TableCell>{legalCase.type}</TableCell>
                  <TableCell>{legalCase.area}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={phaseBadge[getPhaseFromStatus(legalCase.status)]}>
                      {legalCase.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Semaphore color={getSemaphoreFromDeadline(legalCase.deadline) as any} />
                      <span>{new Date(legalCase.deadline).toLocaleDateString("es-CO")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/casos/${legalCase.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}