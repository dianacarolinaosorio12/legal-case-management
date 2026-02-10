"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Search, Clock, ShieldCheck, Phone, ArrowLeft, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ConsultResult = {
  found: boolean
  status?: string
  estimate?: string
  message?: string
}

export default function ConsultaPage() {
  const [radicado, setRadicado] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ConsultResult | null>(null)
  const [attempts, setAttempts] = useState(0)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!radicado.trim()) return
    setLoading(true)
    setResult(null)

    await new Promise((r) => setTimeout(r, 1000))
    setAttempts((prev) => prev + 1)

    if (radicado.toUpperCase().includes("SICOP")) {
      setResult({
        found: true,
        status: "En revision por el profesor",
        estimate: "Aproximadamente 3 dias habiles",
        message:
          "Su caso esta siendo atendido por el Consultorio Juridico. Le contactaremos si necesitamos informacion adicional.",
      })
    } else {
      setResult({
        found: false,
      })
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-xl px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl bg-gradient-navy p-2 shadow-sm">
              <Scale className="text-amber-300" size={20} aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-primary">SICOP</span>
              <span className="text-[10px] text-muted-foreground">Consultorio Juridico</span>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Iniciar sesion
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/[0.08]">
              <Search size={28} className="text-primary" />
            </div>
            <h1 className="text-balance text-3xl font-bold text-foreground tracking-tight">
              Consulta el estado de tu caso
            </h1>
            <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
              Ingresa tu numero de radicado SICOP para verificar el avance de tu caso
            </p>
          </div>

          <Card className="border-border/50 shadow-xl shadow-primary/[0.04] rounded-2xl overflow-hidden">
            <CardContent className="pt-7 px-7 pb-7">
              <form onSubmit={handleSearch} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="radicado" className="text-sm font-medium">
                    Numero de caso radicado SICOP
                  </Label>
                  <Input
                    id="radicado"
                    type="text"
                    placeholder="Ej: SICOP-2024-001234"
                    value={radicado}
                    onChange={(e) => setRadicado(e.target.value)}
                    required
                    className="h-12 font-mono text-base rounded-xl border-border/50 bg-muted/30 focus:bg-card transition-colors"
                    aria-describedby="radicado-help"
                  />
                  <span id="radicado-help" className="text-xs text-muted-foreground">
                    Formato: SICOP-AAAA-NNNNNN
                  </span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 text-base font-semibold rounded-xl shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25"
                  disabled={loading || attempts >= 5}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Consultando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search size={18} />
                      Consultar estado
                    </span>
                  )}
                </Button>

                {attempts >= 5 && (
                  <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    Ha excedido el numero maximo de intentos. Intente nuevamente en 30 minutos.
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <div className="mt-6">
              {result.found ? (
                <Card className="border-border/50 shadow-xl shadow-primary/[0.04] rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 px-7 pt-7">
                    <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                      <Clock size={20} className="text-secondary" />
                      Estado del caso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 px-7 pb-7">
                    <div className="flex items-center gap-3 rounded-xl bg-primary/[0.06] px-4 py-3">
                      <div className="h-3 w-3 rounded-full bg-secondary animate-pulse" aria-hidden="true" />
                      <span className="font-semibold text-foreground">{result.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">Siguiente paso estimado:</p>
                      <p>{result.estimate}</p>
                    </div>
                    <p className="text-sm text-foreground">{result.message}</p>
                    <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
                      <ShieldCheck size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Por seguridad, no mostramos detalles del caso en esta consulta publica.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/50 shadow-xl shadow-primary/[0.04] rounded-2xl overflow-hidden">
                  <CardContent className="pt-7 px-7 pb-7">
                    <div role="alert" className="text-center text-muted-foreground">
                      <p className="font-semibold text-foreground">
                        Datos incorrectos o caso no encontrado
                      </p>
                      <p className="mt-1 text-sm">
                        Verifique el numero de radicado e intente nuevamente.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Phone size={14} />
              Olvido su numero de radicado? Comuniquese al (601) 555-0123
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-card/80 backdrop-blur-xl px-4 py-4 text-center text-sm text-muted-foreground">
        Consultorio Juridico - Universitaria de Colombia |{" "}
        <Link href="/login" className="text-secondary underline-offset-4 hover:underline">
          Acceso al sistema
        </Link>
      </footer>
    </div>
  )
}
