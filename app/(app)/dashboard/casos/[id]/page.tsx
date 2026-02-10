"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
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
  Smile,
  Meh,
  Frown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
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

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const caseData = mockCases.find((c) => c.id === id) || mockCases[0]
  const [newComment, setNewComment] = useState("")
  const [showSurveyDialog, setShowSurveyDialog] = useState(false)
  const [surveyRating, setSurveyRating] = useState<string | null>(caseData.survey?.rating || null)

  const statusColor: Record<string, string> = {
    Evaluacion: "bg-muted text-muted-foreground",
    Sustanciacion: "bg-accent/15 text-accent-foreground",
    "Revision del profesor": "bg-secondary/15 text-secondary",
    Aprobado: "bg-success/15 text-success",
    Seguimiento: "bg-primary/15 text-primary",
    Cerrado: "bg-muted text-muted-foreground",
  }

  // Current phase (1-4)
  const currentPhase = getPhaseFromStatus(caseData.status)
  const currentStepIndex = currentPhase - 1

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      <Link
        href="/dashboard/casos"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Volver a Mis Casos
      </Link>

      {/* Case Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-foreground">{caseData.radicado}</h1>
            <Badge className={statusColor[caseData.status] || ""}>{caseData.status}</Badge>
            {/* RF-20: High risk alert */}
            {caseData.highRiskAlert && (
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
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <Edit size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <Send size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Enviar a revision</span>
            <span className="sm:hidden">Enviar</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Mas opciones">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Duplicar caso</DropdownMenuItem>
              <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
              <DropdownMenuItem>Imprimir</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Archivar caso</DropdownMenuItem>
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
          <TabsTrigger value="comentarios" className={tabTriggerClass}>
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

              {/* RF-22: Interview notes */}
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

              {/* RF-07: Procesal Deadlines */}
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

              {/* RF-27: Reserved Data (only visible to assigned student/professor) */}
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
                      <dt className="text-muted-foreground">Profesor asignado</dt>
                      <dd className="text-foreground">{caseData.assignedProfessor}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* RF-18: Satisfaction Survey */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">
                    Encuesta de Satisfaccion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {caseData.survey ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                      {caseData.survey.rating === "satisfecho" && (
                        <Smile size={40} className="text-success" />
                      )}
                      {caseData.survey.rating === "neutral" && (
                        <Meh size={40} className="text-accent" />
                      )}
                      {caseData.survey.rating === "insatisfecho" && (
                        <Frown size={40} className="text-destructive" />
                      )}
                      <span className="text-sm font-medium capitalize text-foreground">
                        {caseData.survey.rating}
                      </span>
                      {caseData.survey.comment && (
                        <p className="text-xs text-muted-foreground">
                          {`"${caseData.survey.comment}"`}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <p className="text-sm text-muted-foreground">
                        Aun no se ha calificado la atencion.
                      </p>
                      <Dialog open={showSurveyDialog} onOpenChange={setShowSurveyDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            Calificar atencion
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Como fue la atencion?</DialogTitle>
                            <DialogDescription>
                              Seleccione una opcion para calificar el servicio recibido.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex items-center justify-center gap-6 py-4">
                            <button
                              type="button"
                              className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-colors ${surveyRating === "satisfecho" ? "bg-success/15" : "hover:bg-muted"}`}
                              onClick={() => setSurveyRating("satisfecho")}
                              aria-label="Satisfecho"
                            >
                              <Smile size={40} className={surveyRating === "satisfecho" ? "text-success" : "text-muted-foreground"} />
                              <span className="text-xs">Satisfecho</span>
                            </button>
                            <button
                              type="button"
                              className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-colors ${surveyRating === "neutral" ? "bg-accent/15" : "hover:bg-muted"}`}
                              onClick={() => setSurveyRating("neutral")}
                              aria-label="Neutral"
                            >
                              <Meh size={40} className={surveyRating === "neutral" ? "text-accent" : "text-muted-foreground"} />
                              <span className="text-xs">Neutral</span>
                            </button>
                            <button
                              type="button"
                              className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-colors ${surveyRating === "insatisfecho" ? "bg-destructive/15" : "hover:bg-muted"}`}
                              onClick={() => setSurveyRating("insatisfecho")}
                              aria-label="Insatisfecho"
                            >
                              <Frown size={40} className={surveyRating === "insatisfecho" ? "text-destructive" : "text-muted-foreground"} />
                              <span className="text-xs">Insatisfecho</span>
                            </button>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => setShowSurveyDialog(false)} disabled={!surveyRating}>
                              Enviar calificacion
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Documentos (RF-03, RF-04, RF-16) */}
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
                    {doc.type === "docx" && !doc.isApproved && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs bg-transparent"
                        aria-label={`Editar ${doc.name}`}
                      >
                        <Edit size={14} />
                        Editar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: RF-17 Auditoria */}
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

        {/* Tab: Chat */}
        <TabsContent value="comentarios" className="mt-6">
          <Card className="border-border">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="mb-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
                <p className="text-sm font-medium text-foreground">
                  Chat con: <span className="text-primary">{caseData.assignedProfessor}</span>
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {mockComments.map((comment) => {
                  const isStudent = comment.role === "Estudiante"
                  return (
                    <div
                      key={comment.id}
                      className={`flex gap-3 ${isStudent ? "" : "flex-row-reverse"}`}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                        aria-hidden="true"
                      >
                        {comment.avatar}
                      </div>
                      <div
                        className={`flex max-w-[75%] flex-col gap-1 rounded-lg p-3 ${
                          isStudent
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{comment.user}</span>
                          <span
                            className={`text-xs ${isStudent ? "text-muted-foreground" : "text-primary-foreground/70"}`}
                          >
                            {comment.role}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.message}</p>
                        {comment.hasAttachment && (
                          <div
                            className={`mt-1 flex items-center gap-2 rounded px-2 py-1 text-xs ${isStudent ? "bg-card" : "bg-primary-foreground/10"}`}
                          >
                            <Paperclip size={12} aria-hidden="true" />
                            {comment.attachmentName}
                          </div>
                        )}
                        <span
                          className={`text-xs ${isStudent ? "text-muted-foreground" : "text-primary-foreground/60"}`}
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
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                    aria-label="Escribir nuevo comentario"
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

        {/* Tab: RF-12 Sustitucion */}
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
                      <p className="text-xs text-muted-foreground">
                        Toda la trazabilidad del caso fue transferida al nuevo estudiante.
                      </p>
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
