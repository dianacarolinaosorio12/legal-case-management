"use client"

import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockCases, mockCalendarEvents } from "@/lib/mock-data"

const DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
const DAYS_SHORT = ["L", "M", "X", "J", "V", "S", "D"]
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

interface DeadlineCalendarProps {
  title?: string
}

export function DeadlineCalendar({ title = "Calendario de Vencimientos" }: DeadlineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 1, 1))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Generate deadline events from cases + calendar events
  const deadlineEvents = useMemo(() => {
    const fromCases = mockCases.flatMap((c) =>
      c.procesalDeadlines
        .filter((dl) => !dl.completed)
        .map((dl) => ({
          id: dl.id,
          title: `${dl.name} - ${c.radicado}`,
          date: dl.dueDate,
          time: "23:59",
          caseName: c.clientName,
          caseRadicado: c.radicado,
        }))
    )

    const fromCalendar = mockCalendarEvents
      .filter((e) => e.type === "deadline")
      .map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        caseName: "",
        caseRadicado: "",
      }))

    // Merge and deduplicate by date+title similarity
    const all = [...fromCases, ...fromCalendar]
    const seen = new Set<string>()
    return all.filter((e) => {
      const key = `${e.date}-${e.title}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [])

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return deadlineEvents.filter((e) => e.date === dateStr)
  }

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const upcomingDeadlines = deadlineEvents
    .filter((e) => e.date >= `${year}-${String(month + 1).padStart(2, "0")}-01`)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">{title}</h1>

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
                const events = day ? getEventsForDay(day) : []
                const isToday = day === 10
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
                          {events.map((event) => (
                            <div
                              key={event.id}
                              className="truncate rounded px-0.5 sm:px-1 py-0.5 text-[10px] sm:text-xs bg-destructive/15 text-destructive"
                              title={event.title}
                            >
                              <span className="hidden sm:inline">
                                {event.title.substring(0, 25)}
                              </span>
                              <span className="sm:hidden block h-1.5 w-1.5 rounded-full mx-auto bg-destructive" />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <CalendarDays size={18} aria-hidden="true" />
              Proximos Vencimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {upcomingDeadlines.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay vencimientos proximos.</p>
              )}
              {upcomingDeadlines.map((event) => (
                <div key={event.id} className="flex flex-col gap-1 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-destructive/15 text-destructive">
                      <AlertTriangle size={12} className="mr-1" />
                      Vencimiento
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
