"use client"

import { useState } from "react"
import { User, Mail, Shield, BookOpen, GraduationCap, Lock, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

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
