"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn, Scale, BookOpen, GraduationCap, BookText, Settings, ArrowRight, FileText, Users, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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

  function handleDemoLogin(userId: string, route: string) {
    login(userId)
    router.push(route)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] bg-gradient-navy relative flex-col justify-between p-10 overflow-hidden">
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
              <span className="text-sm text-white/50 font-light tracking-wide">Sistema de Control de Procesos</span>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Consultorio Juridico<br />
              <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">Universitario</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Plataforma integral de gestion de casos juridicos. Control, seguimiento y trazabilidad de expedientes digitales.
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-5">
            {[
              { icon: FileText, text: "Gestion de expedientes digitales" },
              { icon: Users, text: "Colaboracion profesor-estudiante en tiempo real" },
              { icon: ShieldCheck, text: "Trazabilidad y auditoria completa" },
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
              <span className="text-xs text-muted-foreground leading-none">Sistema de Control de Procesos</span>
            </div>
          </div>

          <Card className="border-border/50 shadow-xl shadow-primary/[0.04] overflow-hidden rounded-2xl">
            <CardHeader className="flex flex-col gap-2 pb-2 pt-7 px-7">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Iniciar Sesion</h1>
              <p className="text-sm text-muted-foreground">
                Ingrese sus credenciales institucionales
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
                  <Label htmlFor="email" className="text-sm font-medium">Correo institucional</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@universidad.edu.co"
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
                  <Link href="#" className="text-sm text-secondary underline-offset-4 hover:underline">
                    Olvido su contrasena?
                  </Link>
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
    </div>
  )
}
