"use client"

import { useState } from "react"
import { User, Mail, Shield, BookOpen, GraduationCap, Lock, Eye, EyeOff, Clock, Calendar, Timer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { mockUsers } from "@/lib/mock-data"

const roleBadgeColors: Record<string, string> = {
  estudiante: "bg-blue-100 text-blue-800 border-blue-200",
  profesor: "bg-purple-100 text-purple-800 border-purple-200",
  administrativo: "bg-amber-100 text-amber-800 border-amber-200",
}

const roleLabels: Record<string, string> = {
  estudiante: "Estudiante",
  profesor: "Profesor",
  administrativo: "Administrativo",
}

export function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword

  function handleChangePassword() {
    if (!canSubmit) return
    toast({
      title: "Contrasena actualizada",
      description: "Su contrasena ha sido cambiada exitosamente.",
    })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">Mi Perfil</h1>

      {/* User Information */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User size={20} aria-hidden="true" />
            Informacion Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nombre</Label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                <User size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{user.name}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Correo Electronico</Label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                <Mail size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{user.email}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Rol</Label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                <Shield size={16} className="text-muted-foreground" />
                <Badge variant="outline" className={roleBadgeColors[user.role] || ""}>
                  {roleLabels[user.role] || user.role}
                </Badge>
              </div>
            </div>

            {user.area && (
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Area</Label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                  <BookOpen size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{user.area}</span>
                </div>
              </div>
            )}

            {user.role === "estudiante" && user.semester && (
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Semestre</Label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                  <GraduationCap size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{user.semester}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Practice Hours Tracking - Students only */}
      {user.role === "estudiante" && (() => {
        const mockUser = mockUsers.find((u) => u.name === user.name) || mockUsers.find((u) => u.role === "estudiante")
        const totalPracticeHours = mockUser?.totalPracticeHours || 0
        const practiceStartDate = mockUser?.practiceStartDate
        const startDate = practiceStartDate ? new Date(practiceStartDate) : new Date()
        const now = new Date()
        const weeksElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)))
        const monthsElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)))

        // Limits
        const MAX_HOURS_WEEK = 8
        const MAX_HOURS_MONTH = 32
        const PRACTICE_DURATION_MONTHS = 6
        const TOTAL_MAX_HOURS = MAX_HOURS_MONTH * PRACTICE_DURATION_MONTHS // 192h total

        const avgHoursPerWeek = +(totalPracticeHours / weeksElapsed).toFixed(1)
        const avgHoursPerMonth = +(totalPracticeHours / monthsElapsed).toFixed(1)
        const progressPercent = Math.min(100, (monthsElapsed / PRACTICE_DURATION_MONTHS) * 100)
        const hoursProgressPercent = Math.min(100, (totalPracticeHours / TOTAL_MAX_HOURS) * 100)

        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + PRACTICE_DURATION_MONTHS)
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))

        const isSuspended = mockUser?.practiceSuspension?.isActive

        return (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Timer size={20} aria-hidden="true" />
                Control de Horas de Practica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                {isSuspended && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-sm font-medium text-destructive">Practica suspendida temporalmente</p>
                    <p className="text-xs text-muted-foreground mt-1">La suspension fue aplicada por el administrador. Contacte a la coordinacion para mas informacion.</p>
                  </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <Clock size={18} className="text-primary" aria-hidden="true" />
                    <span className="text-xl font-bold text-foreground">{totalPracticeHours}h</span>
                    <span className="text-[10px] text-muted-foreground">Total acumulado</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <Calendar size={18} className="text-secondary" aria-hidden="true" />
                    <span className="text-xl font-bold text-foreground">{avgHoursPerWeek}h</span>
                    <span className="text-[10px] text-muted-foreground">Promedio/semana</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <Calendar size={18} className="text-success" aria-hidden="true" />
                    <span className="text-xl font-bold text-foreground">{avgHoursPerMonth}h</span>
                    <span className="text-[10px] text-muted-foreground">Promedio/mes</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <Timer size={18} className="text-accent-foreground" aria-hidden="true" />
                    <span className="text-xl font-bold text-foreground">{daysRemaining}</span>
                    <span className="text-[10px] text-muted-foreground">Dias restantes</span>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progreso de practica ({monthsElapsed} de {PRACTICE_DURATION_MONTHS} meses)</span>
                      <span className="font-medium text-foreground">{progressPercent.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Horas acumuladas ({totalPracticeHours}h de {TOTAL_MAX_HOURS}h estimadas)</span>
                      <span className="font-medium text-foreground">{hoursProgressPercent.toFixed(0)}%</span>
                    </div>
                    <Progress value={hoursProgressPercent} className="h-2" />
                  </div>
                </div>

                {/* Rules */}
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-foreground mb-2">Reglas de horas de practica:</p>
                  <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      Maximo <strong className="text-foreground">{MAX_HOURS_WEEK} horas</strong> por semana
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                      Maximo <strong className="text-foreground">{MAX_HOURS_MONTH} horas</strong> por mes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                      Duracion total de practicas: <strong className="text-foreground">{PRACTICE_DURATION_MONTHS} meses</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                      El conteo de horas lo realiza el sistema automaticamente segun los terminos procesales
                    </li>
                  </ul>
                </div>

                {practiceStartDate && (
                  <p className="text-xs text-muted-foreground">
                    Inicio de practica: {new Date(practiceStartDate).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                    &nbsp;|&nbsp;Fin estimado: {endDate.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Password Change */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock size={20} aria-hidden="true" />
            Cambiar Contrasena
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentPassword">Contrasena actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingrese su contrasena actual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">Nueva contrasena</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimo 6 caracteres"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
              </div>
              {newPassword.length > 0 && newPassword.length < 6 && (
                <p className="text-xs text-destructive">La contrasena debe tener al menos 6 caracteres</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contrasena</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la nueva contrasena"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Las contrasenas no coinciden</p>
              )}
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={!canSubmit}
              className="w-fit mt-2"
            >
              <Lock size={16} className="mr-2" />
              Cambiar Contrasena
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
