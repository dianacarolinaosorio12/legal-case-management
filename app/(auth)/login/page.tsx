"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn, Scale, BookOpen, GraduationCap, BookText, Settings, ArrowRight, FileText, Users, ShieldCheck, Mail, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react"
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

const demoUsers = [
  {
    id: "u1",
    label: "Estudiante",
    name: "Maria Gonzalez",
    desc: "Gestiona expedientes y documentos",
    icon: GraduationCap,
    route: "/dashboard",
    role: "estudiante" as const,
  },
  {
    id: "u4",
    label: "Profesor",
    name: "Dr. Perez (Laboral)",
    desc: "Revisa y aprueba actuaciones",
    icon: BookText,
    route: "/profesor",
    role: "profesor" as const,
  },
  {
    id: "u7",
    label: "Administrativo",
    name: "Sandra Milena Diaz",
    desc: "Gestion logistica y reasignacion",
    icon: Settings,
    route: "/admin",
    role: "administrativo" as const,
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Password recovery
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const [recoveryStep, setRecoveryStep] = useState<"form" | "sending" | "sent">("form")
  const [recoveryError, setRecoveryError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    await new Promise((r) => setTimeout(r, 800))

    if (email && password) {
      if (email.includes("admin")) {
        login("u7")
        router.push("/admin")
      } else if (email.includes("profesor") || email.includes("prof")) {
        login("u4")
        router.push("/profesor")
      } else {
        login("u1")
        router.push("/dashboard")
      }
    } else {
      setError("Por favor ingrese su correo y contrasena.")
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
    // Simulate sending email
    await new Promise((r) => setTimeout(r, 1500))
    setRecoveryStep("sent")
  }

  function openRecoveryDialog() {
    setRecoveryEmail("")
    setRecoveryError("")
    setRecoveryStep("form")
    setShowRecovery(true)
  }

  function handleDemoLogin(userId: string, route: string) {
    login(userId)
    router.push(route)
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
              Consultorio Juridico<br />
              <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">Centro de Conciliación</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Casos de procesos juridicos, Control de terminos, seguimientos y trazabilidad de expedientes.
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-5">
            {[
            
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-4 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] border border-white/10 group-hover:bg-amber-300/10 transition-colors">
                  <feature.icon size={18} className="text-amber-300/80" />
                </div>
                <span className="text-sm text-white/70 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 border-t border-white/[0.08] pt-6">
          <BookOpen size={16} className="text-white/30" aria-hidden="true" />
          <span className="text-xs text-white/30 tracking-wide">
            Universitaria de Colombia &middot; Educacion Superior de Calidad
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
              <span className="text-xs text-muted-foreground leading-none">Sistema de Control de Practicas</span>
            </div>
          </div>

          <Card className="border-border/50 shadow-xl shadow-primary/[0.04] overflow-hidden rounded-2xl">
            <CardHeader className="flex flex-col gap-2 pb-2 pt-7 px-7">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Iniciar Sesion</h1>
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
                  <Label htmlFor="password" className="text-sm font-medium">Contrasena</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contrasena"
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
                      aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
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
                      Ingresando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn size={18} />
                      Ingresar al Sistema
                    </span>
                  )}
                </Button>
              </form>

              {/* Demo Role Selector */}
              <div className="mt-6 border-t border-border/50 pt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Acceso rapido (Demo)
                </p>
                <div className="flex flex-col gap-2">
                  {demoUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleDemoLogin(u.id, u.route)}
                      className="flex items-center gap-3 rounded-xl border border-border/50 p-3.5 text-left transition-all hover:bg-muted/60 hover:border-primary/30 hover:shadow-sm group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <u.icon size={18} />
                      </div>
                      <div className="flex flex-1 flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground">{u.label}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {u.name} &middot; {u.desc}
                        </span>
                      </div>
                      <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
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
                <ArrowRight size={16} className="text-primary/40 group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardFooter>
          </Card>
        </main>
        <footer className="mt-8 pb-6 text-center text-xs text-muted-foreground">
          Consultorio Juridico &middot; Universitaria de Colombia
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
