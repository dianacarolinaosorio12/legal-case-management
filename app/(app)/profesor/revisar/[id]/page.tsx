"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Send,
  MoreHorizontal,
  FileText,
  FileIcon,
  Download,
  Eye,
  Paperclip,
  User,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRightLeft,
  RotateCcw,
  ArrowRight,
  XCircle,
  FileSearch,
  Activity,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Semaphore } from "@/components/semaphore"
import { mockCases, mockComments, getPhaseFromStatus } from "@/lib/mock-data"

const PHASE_LABELS = ["Evaluacion", "Revision", "Aprobacion", "Seguimiento"]

const tabTriggerClass =
  "rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"

const phaseInfoMap: Record<number, { title: string; desc: string; color: string; icon: typeof FileSearch }> = {
  1: { title: "Fase 1 - Evaluacion del Caso", desc: "Revise toda la informacion y documentos enviados por el estudiante.", color: "bg-muted border-muted-foreground/20", icon: FileSearch },
  2: { title: "Fase 2 - Revision", desc: "Apruebe o devuelva el caso con observaciones. El estudiante editara segun sus indicaciones.", color: "bg-secondary/10 border-secondary/30", icon: Eye },
  3: { title: "Fase 3 - Aprobacion", desc: "El caso ha sido aprobado. Confirme el Visto Bueno final.", color: "bg-success/10 border-success/30", icon: CheckCircle2 },
  4: { title: "Fase 4 - Seguimiento", desc: "Monitoree el progreso del caso en curso.", color: "bg-primary/10 border-primary/30", icon: Activity },
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const caseData = mockCases.find((c) => c.id === id) || mockCases[0]
  const [newComment, setNewComment] = useState("")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showVistoBuenoDialog, setShowVistoBuenoDialog] = useState(false)
  const [highRisk, setHighRisk] = useState(caseData.highRiskAlert)
  const [riskReason, setRiskReason] = useState(caseData.highRiskReason || "")
  const [notifyEmail, setNotifyEmail] = useState(true)

  const statusColor: Record<string, string> = {
    Evaluacion: "bg-muted text-muted-foreground",
    Sustanciacion: "bg-accent/15 text-accent-foreground",
    "Revision del profesor": "bg-secondary/15 text-secondary",
    Aprobado: "bg-success/15 text-success",
    Seguimiento: "bg-primary/15 text-primary",
    Cerrado: "bg-muted text-muted-foreground",
  }

  const currentPhase = getPhaseFromStatus(caseData.status)
  const currentStepIndex = currentPhase - 1
  const phase = phaseInfoMap[currentPhase]

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      <Link
        href="/profesor"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a bandeja
      </Link>

      {/* Phase Indicator */}
      <Card className={`border ${phase.color}`}>
        <CardContent className="flex items-center gap-4 p-4">
          <phase.icon size={24} className="shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-foreground">{phase.title}</span>
            <span className="text-xs text-muted-foreground">{phase.desc}</span>
          </div>
        </CardContent>
      </Card>

      {/* Case Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-foreground">{caseData.radicado}</h1>
            <Badge className={statusColor[caseData.status] || ""}>{caseData.status}</Badge>
            {highRisk && (
              <Badge className="bg-destructive/15 text-destructive">
                <AlertTriangle size={12} className="mr-1" aria-hidden="true" />
                Riesgo Alto
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Semaphore color={caseData.semaphore} size="lg" showLabel />
            {caseData.semaphore === "red" && (
              <span className="text-sm font-medium text-destructive">
                Vence el{" "}
                {new Date(caseData.deadline).toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                - URGENTE
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Estudiante: <span className="font-medium text-foreground">{caseData.assignedStudent}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Mas opciones">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
              <DropdownMenuItem>Imprimir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Process Flow - 4 Phases */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-muted-foreground">Flujo del proceso</span>
            <div className="flex items-center gap-2">
              {PHASE_LABELS.map((label, i) => {
                const isDone = i < currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div key={label} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isDone
                          ? "bg-success text-success-foreground shadow-sm"
                          : isCurrent
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-primary/10"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <span
                      className={`text-center text-xs ${isCurrent ? "font-bold text-primary" : isDone ? "font-medium text-success" : "text-muted-foreground"}`}
                    >
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
            <Progress value={((currentStepIndex + 1) / PHASE_LABELS.length) * 100} className="mt-1 h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto border-b border-border bg-transparent p-0">
          <TabsTrigger value="resumen" className={tabTriggerClass}>
            Resumen
          </TabsTrigger>
          <TabsTrigger value="documentos" className={tabTriggerClass}>
            Documentos
          </TabsTrigger>
          <TabsTrigger value="auditoria" className={tabTriggerClass}>
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="chat" className={tabTriggerClass}>
            Chat
          </TabsTrigger>
          {caseData.substitutionHistory.length > 0 && (
            <TabsTrigger value="sustitucion" className={tabTriggerClass}>
              Sustitucion
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="resumen" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Description */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">
                    Descripcion del conflicto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed text-foreground">{caseData.description}</p>
                </CardContent>
              </Card>

              {/* Interview notes */}
              {caseData.interviewNotes && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base text-foreground">
                      Notas de entrevista inicial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: caseData.interviewNotes }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Procesal Deadlines */}
              {caseData.procesalDeadlines.length > 0 && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-foreground">
                      <Clock size={18} aria-hidden="true" />
                      Terminos Procesales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      {caseData.procesalDeadlines.map((dl) => (
                        <div
                          key={dl.id}
                          className={`flex items-center justify-between rounded-lg border p-3 ${
                            dl.completed
                              ? "border-success/30 bg-success/5"
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {dl.completed ? (
                              <CheckCircle2 size={18} className="text-success" />
                            ) : (
                              <Clock size={18} className="text-muted-foreground" />
                            )}
                            <span className={`text-sm ${dl.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                              {dl.name}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(dl.dueDate).toLocaleDateString("es-CO", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reserved Data */}
              {caseData.reservedData && (
                <Card className="border-2 border-destructive/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-foreground">
                      <Shield size={18} className="text-destructive" aria-hidden="true" />
                      Datos de Reserva Legal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {caseData.reservedData.hasMinor && (
                          <Badge className="bg-destructive/10 text-destructive">Menor de edad</Badge>
                        )}
                        {caseData.reservedData.hasGeneticData && (
                          <Badge className="bg-destructive/10 text-destructive">Datos geneticos</Badge>
                        )}
                        {caseData.reservedData.hasPensionData && (
                          <Badge className="bg-destructive/10 text-destructive">Datos pensionales</Badge>
                        )}
                      </div>
                      <p className="text-foreground">{caseData.reservedData.notes}</p>
                      <p className="text-xs text-destructive">
                        Solo visible para: {caseData.assignedStudent} y {caseData.assignedProfessor}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Client Info Sidebar */}
            <div className="flex flex-col gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-foreground">
                    <User size={18} aria-hidden="true" />
                    Datos del solicitante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="flex flex-col gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Nombre</dt>
                      <dd className="font-medium text-foreground">{caseData.clientName}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Documento</dt>
                      <dd className="font-mono text-foreground">
                        {caseData.clientDocType} {caseData.clientDoc}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Telefono</dt>
                      <dd className="text-foreground">{caseData.clientPhone}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Correo</dt>
                      <dd className="text-foreground">{caseData.clientEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Direccion</dt>
                      <dd className="text-foreground">{caseData.clientAddress}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Tipo de caso</dt>
                      <dd className="text-foreground">
                        {caseData.type} - {caseData.area}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Estudiante asignado</dt>
                      <dd className="text-foreground">{caseData.assignedStudent}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Risk Alert Toggle */}
              <Card className={`border-border ${highRisk ? "border-destructive/50 bg-destructive/5" : ""}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-foreground">
                    <AlertTriangle size={18} className={highRisk ? "text-destructive" : "text-muted-foreground"} aria-hidden="true" />
                    Riesgo Juridico
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="riskToggle" className="text-sm text-foreground cursor-pointer">
                      Marcar Riesgo Alto
                    </Label>
                    <Switch
                      id="riskToggle"
                      checked={highRisk}
                      onCheckedChange={setHighRisk}
                    />
                  </div>
                  {highRisk && (
                    <Textarea
                      placeholder="Justificacion del riesgo..."
                      value={riskReason}
                      onChange={(e) => setRiskReason(e.target.value)}
                      className="min-h-[60px]"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Phase Actions */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-foreground">Acciones</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
                    <Label htmlFor="notifyEmail" className="text-sm text-foreground cursor-pointer">
                      Notificar por correo
                    </Label>
                    <Switch
                      id="notifyEmail"
                      checked={notifyEmail}
                      onCheckedChange={setNotifyEmail}
                    />
                  </div>

                  {currentPhase === 1 && (
                    <>
                      <Button className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        <ArrowRight size={16} aria-hidden="true" />
                        Pasar a Revision
                      </Button>
                      <Button variant="outline" className="w-full gap-2 bg-transparent">
                        <RotateCcw size={16} aria-hidden="true" />
                        Devolver al Estudiante
                      </Button>
                    </>
                  )}

                  {currentPhase === 2 && (
                    <>
                      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90">
                            <CheckCircle2 size={16} aria-hidden="true" />
                            Aprobar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar aprobacion</DialogTitle>
                            <DialogDescription>
                              Esta a punto de aprobar el caso {caseData.radicado}.
                              El estudiante sera notificado{notifyEmail ? " por correo electronico" : ""}.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancelar</Button>
                            <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setShowApproveDialog(false)}>
                              Si, aprobar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" className="w-full gap-2 bg-transparent">
                        <RotateCcw size={16} aria-hidden="true" />
                        Devolver con Observaciones
                      </Button>
                    </>
                  )}

                  {currentPhase === 3 && (
                    <>
                      <Dialog open={showVistoBuenoDialog} onOpenChange={setShowVistoBuenoDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2">
                            <Lock size={16} aria-hidden="true" />
                            Visto Bueno Final
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Otorgar Visto Bueno</DialogTitle>
                            <DialogDescription>
                              La actuacion sera convertida a un PDF no editable. Esta accion no se puede deshacer.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setShowVistoBuenoDialog(false)}>Cancelar</Button>
                            <Button onClick={() => setShowVistoBuenoDialog(false)}>
                              <Lock size={16} className="mr-2" />
                              Confirmar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90">
                        <ArrowRight size={16} aria-hidden="true" />
                        Pasar a Seguimiento
                      </Button>
                    </>
                  )}

                  {currentPhase === 4 && (
                    <Button className="w-full gap-2 bg-muted text-foreground hover:bg-muted/80">
                      <XCircle size={16} aria-hidden="true" />
                      Cerrar Caso
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Documentos */}
        <TabsContent value="documentos" className="mt-6">
          <div className="flex flex-col gap-4">
            {caseData.documents.map((doc) => (
              <Card key={doc.id} className="border-border">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {doc.type === "docx" ? (
                      <FileIcon size={28} className="shrink-0 text-secondary" aria-hidden="true" />
                    ) : (
                      <FileText
                        size={28}
                        className={`shrink-0 ${doc.type === "pdf" ? "text-destructive" : "text-success"}`}
                        aria-hidden="true"
                      />
                    )}
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{doc.name}</span>
                        {doc.isApproved && (
                          <Badge className="bg-success/15 text-success text-xs">
                            <Lock size={10} className="mr-1" />
                            VoBo
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">v{doc.version}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {doc.size} | {doc.uploadedBy} |{" "}
                        {new Date(doc.uploadDate).toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Ver ${doc.name}`}>
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Descargar ${doc.name}`}>
                      <Download size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Auditoria */}
        <TabsContent value="auditoria" className="mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <Shield size={18} aria-hidden="true" />
                Historial de Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative flex flex-col gap-0">
                {caseData.auditLog.map((entry, i) => (
                  <div key={entry.id} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < caseData.auditLog.length - 1 && (
                      <div
                        className="absolute left-[15px] top-8 h-full w-px bg-border"
                        aria-hidden="true"
                      />
                    )}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        entry.role === "IA"
                          ? "bg-secondary/10"
                          : entry.role === "profesor"
                            ? "bg-primary/10"
                            : entry.role === "administrativo"
                              ? "bg-accent/10"
                              : "bg-muted"
                      }`}
                      aria-hidden="true"
                    >
                      <Clock size={14} className="text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{entry.user}</span>{" "}
                        <span className="text-xs text-muted-foreground">
                          ({entry.role === "IA" ? "IA" : entry.role})
                        </span>{" "}
                        {entry.action}
                      </p>
                      {entry.detail && (
                        <p className="text-xs text-muted-foreground">{entry.detail}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {entry.date}, {entry.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Chat (bidirectional - profesor y estudiante) */}
        <TabsContent value="chat" className="mt-6">
          <Card className="border-border">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="mb-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
                <p className="text-sm font-medium text-foreground">
                  Chat con: <span className="text-primary">{caseData.assignedStudent}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Las observaciones y mensajes son visibles para ambos. Utilice este chat para comunicar correcciones, observaciones y avances.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {mockComments.map((comment) => {
                  const isProfessor = comment.role === "Profesor"
                  return (
                    <div
                      key={comment.id}
                      className={`flex gap-3 ${isProfessor ? "" : "flex-row-reverse"}`}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                        aria-hidden="true"
                      >
                        {comment.avatar}
                      </div>
                      <div
                        className={`flex max-w-[75%] flex-col gap-1 rounded-lg p-3 ${
                          isProfessor
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{comment.user}</span>
                          <span
                            className={`text-xs ${isProfessor ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                          >
                            {comment.role}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.message}</p>
                        {comment.hasAttachment && (
                          <div
                            className={`mt-1 flex items-center gap-2 rounded px-2 py-1 text-xs ${isProfessor ? "bg-primary-foreground/10" : "bg-card"}`}
                          >
                            <Paperclip size={12} aria-hidden="true" />
                            {comment.attachmentName}
                          </div>
                        )}
                        <span
                          className={`text-xs ${isProfessor ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                        >
                          {comment.timestamp}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3 border-t border-border pt-4">
                <div className="flex flex-1 flex-col gap-2">
                  <Textarea
                    placeholder="Escriba observaciones o mensajes para el estudiante..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                    aria-label="Escribir mensaje"
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                      <Paperclip size={16} aria-hidden="true" />
                      Adjuntar archivo
                    </Button>
                    <Button size="sm" className="flex items-center gap-2">
                      <Send size={14} aria-hidden="true" />
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Sustitucion */}
        {caseData.substitutionHistory.length > 0 && (
          <TabsContent value="sustitucion" className="mt-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <ArrowRightLeft size={18} aria-hidden="true" />
                  Historial de Sustitucion de Proceso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {caseData.substitutionHistory.map((sub, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-accent/15 text-accent-foreground">
                          Sustitucion #{i + 1}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{sub.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">{sub.from}</span>
                        <ArrowRightLeft size={14} className="text-muted-foreground" />
                        <span className="font-medium text-foreground">{sub.to}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Motivo: {sub.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
