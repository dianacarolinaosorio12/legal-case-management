"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import apiClient from "@/lib/api-client"

const DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
const DAYS_SHORT = ["L", "M", "X", "J", "V", "S", "D"]
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  color: string
  extendedProps: {
    area: string
    despacho: string
    radicado: string
    numeroProceso: string
    demandante: string
    demandado: string
    tipoTermino: string
    diasRestantes: number
    caseId: string
  }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function getSemaphoreFromColor(color: string): "red" | "yellow" | "green" {
  if (color === "#ef4444") return "red"
  if (color === "#f59e0b") return "yellow"
  return "green"
}

const semaphoreStyles = {
  red: { bg: "bg-destructive/15", text: "text-destructive", dot: "bg-destructive", border: "border-destructive/30", label: "Urgente" },
  yellow: { bg: "bg-amber-500/15", text: "text-amber-600", dot: "bg-amber-500", border: "border-amber-500/30", label: "Próximo" },
  green: { bg: "bg-success/15", text: "text-success", dot: "bg-success", border: "border-success/30", label: "En tiempo" },
}

interface DeadlineCalendarProps {
  title?: string
}

export function DeadlineCalendar({ title = "Calendario de Vencimientos" }: DeadlineCalendarProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    async function fetchCalendarEvents() {
      try {
        const response = await apiClient.cases.getCalendarEvents() as unknown as CalendarEvent[]
        setEvents(response)
      } catch (error) {
        console.error("Error fetching calendar events:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCalendarEvents()
  }, [])

  const deadlineEvents = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.start,
      radicado: event.extendedProps.radicado,
      numeroProceso: event.extendedProps.numeroProceso,
      demandante: event.extendedProps.demandante,
      demandado: event.extendedProps.demandado,
      tipoTermino: event.extendedProps.tipoTermino,
      area: event.extendedProps.area,
      despacho: event.extendedProps.despacho,
      diasRestantes: event.extendedProps.diasRestantes,
      caseId: event.extendedProps.caseId,
      semaphore: getSemaphoreFromColor(event.color),
    }))
  }, [events])

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return deadlineEvents.filter((e) => e.date === dateStr)
  }

  const days: (number | null)[] = []
  for (let i = 0; i < getFirstDayOfMonth(year, month); i++) days.push(null)
  for (let i = 1; i <= getDaysInMonth(year, month); i++) days.push(i)

  const todayDay = new Date().getDate()
  const todayMonth = new Date().getMonth()
  const todayYear = new Date().getFullYear()

  // Semaphore summary counts
  const redCount = deadlineEvents.filter((e) => e.semaphore === "red").length
  const yellowCount = deadlineEvents.filter((e) => e.semaphore === "yellow").length
  const greenCount = deadlineEvents.filter((e) => e.semaphore === "green").length

  // Sorted: red first, then yellow, then green
  const upcomingDeadlines = deadlineEvents
    .sort((a, b) => {
      const order = { red: 0, yellow: 1, green: 2 }
      if (order[a.semaphore] !== order[b.semaphore]) return order[a.semaphore] - order[b.semaphore]
      return a.date.localeCompare(b.date)
    })
    .slice(0, 8)

  const handleEventClick = (event: typeof deadlineEvents[0]) => {
    const fullEvent = events.find(e => e.id === event.id)
    if (fullEvent) {
      setSelectedEvent(fullEvent)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">{title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays size={16} />
          <span>Hoy: {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      )}

      {!loading && (
        <>
          {/* Semaphore Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15">
                  <AlertTriangle size={18} className="text-destructive" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-destructive">{redCount}</span>
                  <p className="text-xs text-destructive/80">Urgentes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15">
                  <Clock size={18} className="text-amber-600" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-amber-600">{yellowCount}</span>
                  <p className="text-xs text-amber-600/80">Próximo</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-success/30 bg-success/5">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
                  <CheckCircle2 size={18} className="text-success" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-success">{greenCount}</span>
                  <p className="text-xs text-success/80">En tiempo</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            {/* Calendar Grid */}
            <Card className="border-border xl:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={prevMonth} aria-label="Mes anterior">
                    <ChevronLeft size={20} />
                  </Button>
                  <h2 className="text-lg font-semibold text-foreground">
                    {MONTHS[month]} {year}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={nextMonth} aria-label="Mes siguiente">
                    <ChevronRight size={20} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Hoy
                  </Button>
                </div>
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">Urgente</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">Próximo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-success" />
                    <span className="text-muted-foreground">En tiempo</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Days header */}
                <div className="grid grid-cols-7 gap-px border-b border-border pb-2">
                  {DAYS.map((day, i) => (
                    <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{DAYS_SHORT[i]}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-px">
                  {days.map((day, i) => {
                    const dayEvents = day ? getEventsForDay(day) : []
                    const isToday = day === todayDay && month === todayMonth && year === todayYear
                    return (
                      <div
                        key={i}
                        className={`min-h-[48px] sm:min-h-[80px] border-b border-border p-0.5 sm:p-1 ${
                          day ? "bg-card" : "bg-muted/30"
                        }`}
                      >
                        {day && (
                          <>
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                                isToday
                                  ? "bg-primary font-bold text-primary-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {day}
                            </span>
                            <div className="mt-0.5 flex flex-col gap-0.5">
                              {dayEvents.map((event) => {
                                const style = semaphoreStyles[event.semaphore]
                                return (
                                  <div
                                    key={event.id}
                                    onClick={() => handleEventClick(event)}
                                    className={`truncate cursor-pointer rounded px-0.5 sm:px-1 py-0.5 text-[10px] sm:text-xs ${style.bg} ${style.text} hover:opacity-80`}
                                    title={`${event.title} - ${style.label}`}
                                  >
                                    <span className="hidden sm:inline">
                                      {event.title.substring(0, 25)}
                                    </span>
                                    sm:hidden block<span className={` h-1.5 w-1.5 rounded-full mx-auto ${style.dot}`} />
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Semaphore Sidebar */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <CalendarDays size={18} aria-hidden="true" />
                  Próximos Vencimientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {upcomingDeadlines.length === 0 && (
                    <p className="text-sm text-muted-foreground">No hay vencimientos pendientes.</p>
                  )}
                  {upcomingDeadlines.map((event) => {
                    const style = semaphoreStyles[event.semaphore]
                    return (
                      <div 
                        key={event.id} 
                        onClick={() => handleEventClick(event)}
                        className={`flex flex-col gap-1.5 rounded-lg border ${style.border} p-3 cursor-pointer hover:bg-muted/50`}
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className={`${style.bg} ${style.text}`}>
                            <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${style.dot} ${event.semaphore === "red" ? "animate-pulse" : ""}`} />
                            {event.diasRestantes} días
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">{event.tipoTermino}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground font-mono">{event.radicado}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("es-CO", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Detalles del Término</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Término</p>
                <p className="font-medium">{selectedEvent.extendedProps.tipoTermino}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Número de Proceso</p>
                <p className="font-mono">{selectedEvent.extendedProps.numeroProceso}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Demandante</p>
                  <p className="font-medium">{selectedEvent.extendedProps.demandante}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Demandado</p>
                  <p className="font-medium">{selectedEvent.extendedProps.demandado}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Despacho</p>
                <p className="font-medium">{selectedEvent.extendedProps.despacho}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Área</p>
                <Badge variant="outline">{selectedEvent.extendedProps.area}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                <p className="font-medium">
                  {new Date(selectedEvent.start).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {' '}({selectedEvent.extendedProps.diasRestantes} días restantes)
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedEvent(null)}
                >
                  Cerrar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setSelectedEvent(null)
                    router.push(`/dashboard/casos/${selectedEvent.extendedProps.caseId}`)
                  }}
                >
                  <ExternalLink size={16} className="mr-2" />
                  Ver Expediente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
