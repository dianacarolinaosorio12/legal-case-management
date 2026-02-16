"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn, Scale, Mail, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [recoveryStep, setRecoveryStep] = useState<"form" | "sending" | "sent">("form")
  const [recoveryError, setRecoveryError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      
      const userRole = localStorage.getItem("sicop_user")
      if (userRole) {
        const user = JSON.parse(userRole)
        
        switch (user.role) {
          case "profesor":
            router.push("/profesor")
            break
          case "administrativo":
            router.push("/admin")
            break
          case "estudiante":
          default:
            router.push("/dashboard")
            break
        }
      } else {
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      const error = err as { status?: number; message?: string }
      if (error.status === 401) {
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.")
      } else if (error.status === 0 || error.status === undefined) {
        setError("No se pudo conectar al servidor. Verifica que el backend esté corriendo en el puerto 3001.")
      } else {
        setError(error.message || "Error al iniciar sesión. Intenta de nuevo.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault()
    setRecoveryError("")

    if (!recoveryEmail.trim()) {
      setRecoveryError("Por favor ingrese su correo electronico.")
      return
    }
    if (!recoveryEmail.includes("@")) {
      setRecoveryError("Por favor ingrese un correo valido.")
      return
    }

    setRecoveryStep("sending")
    await new Promise((r) => setTimeout(r, 1500))
    setRecoveryStep("sent")
  }

  function openRecoveryDialog() {
    setRecoveryEmail("")
    setRecoveryError("")
    setRecoveryStep("form")
    setShowRecovery(true)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative flex-col justify-between p-10 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/edificio-login.png')" }}
        />
        {/* Navy overlay */}
        <div className="absolute inset-0 bg-[#030568]/80" />
        {/* Decorative blurs */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-300/5 blur-3xl" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/[0.03] blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="flex items-center justify-center rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10 shadow-lg">
              <Scale className="text-amber-300" size={32} aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tight text-white">SICOP</span>
              <span className="text-sm text-white/50 font-light tracking-wide">Sistema de Control de Prácticas</span>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Consultorio Jurídico<br />
              <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">Centro de Conciliación</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Casos de procesos jurídicos, Control de términos, seguimientos y trazabilidad de expedientes.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 border-t border-white/[0.08] pt-6">
          <span className="text-xs text-white/30 tracking-wide">
            Universitaria de Colombia · Educación Superior de Calidad
          </span>
        </div>
      </div>

      {/* Right panel - Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-8">
        <main id="main-content" className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex items-center justify-center rounded-2xl bg-gradient-navy p-2.5 shadow-lg">
              <Scale className="text-amber-300" size={28} aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-primary">SICOP</span>
              <span className="text-xs text-muted-foreground leading-none">Sistema de Control de Prácticas</span>
            </div>
          </div>

          <Card className="border-border/50 shadow-xl shadow-primary/[0.04] overflow-hidden rounded-2xl">
            <CardHeader className="flex flex-col gap-2 pb-2 pt-7 px-7">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Iniciar Sesión</h1>
              <p className="text-sm text-muted-foreground">
                Ingrese sus credenciales para acceder
              </p>
            </CardHeader>
            <CardContent className="px-7 pb-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">Correo electronico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 rounded-xl border-border/50 bg-muted/30 focus:bg-card transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11 pr-12 rounded-xl border-border/50 bg-muted/30 focus:bg-card transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" aria-label="Recordarme en este dispositivo" />
                    <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                      Recordarme
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={openRecoveryDialog}
                    className="text-sm text-secondary underline-offset-4 hover:underline"
                  >
                    Olvido su contrasena?
                  </button>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Iniciando sesión...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn size={18} />
                      Ingresar al Sistema
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-0 border-t border-border/50 bg-gradient-to-r from-primary/[0.04] via-secondary/[0.04] to-primary/[0.04] p-0 overflow-hidden">
              <Link
                href="/consulta"
                className="flex items-center justify-center gap-3 w-full px-6 py-5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                  <Scale size={16} />
                </div>
                <span>Consultar estado de un caso</span>
              </Link>
            </CardFooter>
          </Card>
        </main>
        <footer className="mt-8 pb-6 text-center text-xs text-muted-foreground">
          Consultorio Jurídico · Universitaria de Colombia
        </footer>
      </div>

      {/* Password Recovery Dialog */}
      <Dialog open={showRecovery} onOpenChange={setShowRecovery}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-2xl border-border/50">
          {/* Header gradient */}
          <div className="bg-gradient-to-br from-[#030568] to-[#050a8e] px-7 pt-8 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-lg">
                {recoveryStep === "sent" ? (
                  <CheckCircle2 size={32} className="text-amber-300" />
                ) : (
                  <KeyRound size={32} className="text-amber-300" />
                )}
              </div>
            </div>
            <DialogHeader className="text-center space-y-1.5">
              <DialogTitle className="text-xl font-bold text-white">
                {recoveryStep === "sent" ? "Correo enviado" : "Recuperar contrasena"}
              </DialogTitle>
              <DialogDescription className="text-white/50 text-sm">
                {recoveryStep === "sent"
                  ? "Revise su bandeja de entrada"
                  : "Le enviaremos un enlace de recuperacion a su correo"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-7 pb-7 pt-5">
            {recoveryStep === "form" && (
              <form onSubmit={handleRecovery} className="flex flex-col gap-4">
                {recoveryError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {recoveryError}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="recoveryEmail" className="text-sm font-medium">
                    Correo electronico
                  </Label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="recoveryEmail"
                      type="email"
                      placeholder="usuario@gmail.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      autoFocus
                      autoComplete="email"
                      className="h-11 pl-10 rounded-xl border-border/50 bg-muted/30 focus:bg-card transition-colors"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ingrese el correo asociado a su cuenta para recibir las instrucciones.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25"
                >
                  <Mail size={18} className="mr-2" />
                  Enviar enlace de recuperacion
                </Button>

                <button
                  type="button"
                  onClick={() => setShowRecovery(false)}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={14} />
                  Volver al inicio de sesion
                </button>
              </form>
            )}

            {recoveryStep === "sending" && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Enviando correo...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enviando a {recoveryEmail}
                  </p>
                </div>
              </div>
            )}

            {recoveryStep === "sent" && (
              <div className="flex flex-col gap-5">
                <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-foreground">
                        Correo enviado exitosamente
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hemos enviado un enlace de recuperacion a:
                      </p>
                      <p className="text-sm font-mono font-medium text-primary mt-0.5">
                        {recoveryEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">No recibio el correo?</span> Revise su carpeta de
                    spam o correo no deseado. El enlace expira en 24 horas. Si continua con problemas, contacte a
                    soporte tecnico.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 rounded-xl bg-transparent"
                    onClick={() => {
                      setRecoveryStep("form")
                      setRecoveryEmail("")
                    }}
                  >
                    <Mail size={16} className="mr-2" />
                    Enviar a otro correo
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    <ArrowLeft size={14} />
                    Volver al inicio de sesion
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
