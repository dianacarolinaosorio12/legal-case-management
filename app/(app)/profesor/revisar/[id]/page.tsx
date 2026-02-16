"use client"

import { use, useState, useRef } from "react"
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
  ThumbsUp,
  Trash2,
  Upload,
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
import { mockCases, mockComments, getPhaseFromStatus, type CaseStatus, type AuditEntry } from "@/lib/mock-data"

const PHASE_LABELS = ["Evaluacion", "Revision", "Aprobacion", "Seguimiento", "Cerrado"]

const tabTriggerClass =
  "rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"

const phaseInfoMap: Record<number | string, { title: string; desc: string; color: string; icon: typeof FileSearch }> = {
  1: { title: "Fase 1 - Evaluacion del Caso", desc: "Revise toda la informacion y documentos enviados por el estudiante.", color: "bg-muted border-muted-foreground/20", icon: FileSearch },
  2: { title: "Fase 2 - Revision", desc: "Apruebe o devuelva el caso con observaciones. El estudiante editara segun sus indicaciones.", color: "bg-secondary/10 border-secondary/30", icon: Eye },
  3: { title: "Fase 3 - Aprobacion", desc: "El caso ha sido aprobado. Pase el caso a seguimiento cuando este listo.", color: "bg-success/10 border-success/30", icon: CheckCircle2 },
  4: { title: "Fase 4 - Seguimiento", desc: "Monitoree el progreso del caso en curso. Las horas del estudiante estan aprobadas.", color: "bg-primary/10 border-primary/30", icon: Activity },
  Cerrado: { title: "Caso Cerrado", desc: "Este caso ha sido cerrado definitivamente. No hay mas acciones disponibles.", color: "bg-muted border-muted-foreground/30", icon: Lock },
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const caseData = mockCases.find((c) => c.id === id) || mockCases[0]

  // ── Functional State ─────────────────────────────────────────────
  const [currentStatus, setCurrentStatus] = useState<CaseStatus>(caseData.status)
  const [hoursApproved, setHoursApproved] = useState(caseData.hoursApproved)
  const [newComment, setNewComment] = useState("")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [highRisk, setHighRisk] = useState(caseData.highRiskAlert)
  const [riskReason, setRiskReason] = useState(caseData.highRiskReason || "")
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [returnObservation, setReturnObservation] = useState("")
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(caseData.auditLog)
  const [chatMessages, setChatMessages] = useState(mockComments)
  const [documents, setDocuments] = useState(caseData.documents)
  const [showDeleteDocDialog, setShowDeleteDocDialog] = useState(false)
  const [docToDelete, setDocToDelete] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const statusColor: Record<string, string> = {
    Evaluacion: "bg-muted text-muted-foreground",
    Sustanciacion: "bg-accent/15 text-accent-foreground",
    "Revision del profesor": "bg-secondary/15 text-secondary",
    Aprobado: "bg-success/15 text-success",
    Seguimiento: "bg-primary/15 text-primary",
    Cerrado: "bg-muted text-muted-foreground",
  }

  const currentPhase = getPhaseFromStatus(currentStatus)
  const currentStepIndex = currentPhase - 1
  const phase = currentStatus === "Cerrado" ? phaseInfoMap["Cerrado"] : phaseInfoMap[currentPhase]

  function addAudit(action: string, detail?: string) {
    const now = new Date()
    const entry: AuditEntry = {
      id: `dyn-${Date.now()}`,
      date: now.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
      time: now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase(),
      user: caseData.assignedProfessor,
      role: "profesor",
      action,
      detail,
    }
    setAuditLog((prev) => [...prev, entry])
  }

  function showFeedback(msg: string) {
    setActionFeedback(msg)
    setTimeout(() => setActionFeedback(null), 4000)
  }

  // ── Phase Actions ────────────────────────────────────────────────
  function handlePassToReview() {
    setCurrentStatus("Revision del profesor")
    addAudit("Paso el caso a Fase 2 - Revision", "El caso ahora esta en revision por el profesor.")
    showFeedback("Caso movido a Fase 2 - Revision")
  }

  function handleReturn() {
    setCurrentStatus("Sustanciacion")
    addAudit("Devolvio el caso al estudiante con observaciones", returnObservation || "Sin observaciones adicionales")
    setReturnObservation("")
    setShowReturnDialog(false)
    showFeedback("Caso devuelto al estudiante con observaciones")
  }

  function handleApprove() {
    setCurrentStatus("Aprobado")
    addAudit("Aprobo el caso", `El caso ${caseData.radicado} fue aprobado por el profesor.`)
    setShowApproveDialog(false)
    showFeedback("Caso aprobado exitosamente.")
  }

  function handlePassToFollowUp() {
    setCurrentStatus("Seguimiento")
    addAudit("Paso el caso a Fase 4 - Seguimiento", "El caso entra en periodo de seguimiento y monitoreo.")
    showFeedback("Caso movido a Fase 4 - Seguimiento")
  }

  function handleCloseCase() {
    setCurrentStatus("Cerrado")
    addAudit("Cerro el caso", "El caso ha sido cerrado satisfactoriamente.")
    setShowCloseDialog(false)
    showFeedback("Caso cerrado exitosamente")
  }

  function handleReturnToPreviousPhase(targetStatus: CaseStatus, phaseLabel: string) {
    setCurrentStatus(targetStatus)
    addAudit(
      `Devolvio el caso a ${phaseLabel}`,
      `El caso fue devuelto a la fase anterior: ${phaseLabel}.`
    )
    showFeedback(`Caso devuelto a ${phaseLabel}`)
  }

  function handleDeleteDocument() {
    if (!docToDelete) return
    const docName = documents.find((d) => d.id === docToDelete)?.name || "documento"
    setDocuments((prev) => prev.filter((d) => d.id !== docToDelete))
    setDocToDelete(null)
    setShowDeleteDocDialog(false)
    addAudit("Elimino documento", docName)
    showFeedback("Documento eliminado correctamente")
  }

  function handleApproveDocument(docId: string) {
    const docName = documents.find((d) => d.id === docId)?.name || "documento"
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isApproved: true } : d))
    )
    addAudit("Otorgo VoBo a documento", docName)
    showFeedback(`VoBo otorgado a: ${docName}`)
  }

  function processFiles(fileList: FileList) {
    const ALLOWED = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"]
    const MAX_SIZE = 100 * 1024 * 1024
    const newDocs = Array.from(fileList)
      .filter((f) => {
        const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase()
        return ALLOWED.includes(ext) && f.size <= MAX_SIZE
      })
      .map((f) => {
        const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase()
        return {
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: f.name,
          size: f.size >= 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
          type: (ext === ".pdf" ? "pdf" : [".doc", ".docx"].includes(ext) ? "docx" : "image") as "pdf" | "docx" | "image",
          uploadedBy: caseData.assignedProfessor,
          uploadDate: new Date().toISOString().split("T")[0],
          isApproved: false,
          version: 1,
        }
      })
    if (newDocs.length > 0) {
      setDocuments((prev) => [...prev, ...newDocs])
      const names = newDocs.map((d) => d.name).join(", ")
      addAudit("Subio documento(s)", names)
      showFeedback(`${newDocs.length} archivo(s) subido(s) correctamente`)
    }
  }

  function handleDocDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      processFiles(e.target.files)
      e.target.value = ""
    }
  }

  function handleSendMessage() {
    if (!newComment.trim()) return
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        user: caseData.assignedProfessor,
        role: "Profesor",
        avatar: caseData.assignedProfessor.substring(0, 2).toUpperCase(),
        message: newComment,
        timestamp: new Date().toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      },
    ])
    addAudit("Envio observacion al estudiante por chat")
    setNewComment("")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link href="/profesor" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={16} />
        Volver a bandeja
      </Link>

      {/* Feedback Toast */}
      {actionFeedback && (
        <div className="animate-in slide-in-from-top-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success flex items-center gap-2">
          <CheckCircle2 size={16} />
          {actionFeedback}
        </div>
      )}

      {/* Phase Indicator */}
      <Card className={`border ${phase.color}`}>
        <CardContent className="flex items-center gap-4 p-4">
          <phase.icon size={24} className="shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-sm font-bold text-foreground">{phase.title}</span>
            <span className="text-xs text-muted-foreground">{phase.desc}</span>
          </div>
          {currentStatus === "Cerrado" && (
            <Badge className="bg-muted text-muted-foreground shrink-0">
              <Lock size={12} className="mr-1" />
              Cerrado
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Case Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-foreground">{caseData.radicado}</h1>
            <Badge className={statusColor[currentStatus] || ""}>{currentStatus}</Badge>
            {highRisk && (
              <Badge className="bg-destructive/15 text-destructive">
                <AlertTriangle size={12} className="mr-1" />
                Riesgo Alto
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Semaphore color={caseData.semaphore} size="lg" showLabel />
            {caseData.semaphore === "red" && (
              <span className="text-sm font-medium text-destructive">
                Vence el {new Date(caseData.deadline).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })} - URGENTE
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Estudiante: <span className="font-medium text-foreground">{caseData.assignedStudent}</span></span>
            <span>Tipo: <span className="font-medium text-foreground">{caseData.type} - {caseData.area}</span></span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8"><MoreHorizontal size={16} /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
            <DropdownMenuItem>Imprimir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Flow */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Flujo del proceso</span>
              {currentStatus === "Cerrado" && (
                <Badge className="bg-muted text-muted-foreground">
                  <Lock size={12} className="mr-1" />
                  Cerrado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {PHASE_LABELS.map((label, i) => {
                const isClosed = currentStatus === "Cerrado"
                const isLastStep = i === PHASE_LABELS.length - 1 // "Cerrado" step
                const isDone = i < currentStepIndex || (isClosed && !isLastStep)
                const isCurrent = (isClosed && isLastStep) || (!isClosed && i === currentStepIndex)
                return (
                  <div key={label} className="flex flex-1 flex-col items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isClosed && isLastStep
                        ? "bg-muted text-muted-foreground shadow-md ring-4 ring-muted/30"
                        : isDone ? "bg-success text-success-foreground shadow-sm"
                        : isCurrent ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-primary/10"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {isClosed && isLastStep ? <Lock size={14} /> : isDone ? <CheckCircle2 size={14} /> : isCurrent ? i + 1 : i + 1}
                    </div>
                    <span className={`text-center text-xs ${
                      isClosed && isLastStep ? "font-bold text-foreground"
                      : isCurrent ? "font-bold text-primary"
                      : isDone ? "font-medium text-success"
                      : "text-muted-foreground"
                    }`}>{label}</span>
                  </div>
                )
              })}
            </div>
            <Progress value={currentStatus === "Cerrado" ? 100 : ((currentStepIndex + 1) / PHASE_LABELS.length) * 100} className="mt-1 h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto border-b border-border bg-transparent p-0">
          <TabsTrigger value="resumen" className={tabTriggerClass}>Resumen</TabsTrigger>
          <TabsTrigger value="documentos" className={tabTriggerClass}>Documentos</TabsTrigger>
          <TabsTrigger value="auditoria" className={tabTriggerClass}>Auditoria</TabsTrigger>
          <TabsTrigger value="chat" className={tabTriggerClass}>Chat</TabsTrigger>
          {caseData.substitutionHistory.length > 0 && <TabsTrigger value="sustitucion" className={tabTriggerClass}>Sustitucion</TabsTrigger>}
        </TabsList>

        {/* Resumen */}
        <TabsContent value="resumen" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <Card className="border-border">
                <CardHeader><CardTitle className="text-base text-foreground">Descripcion del conflicto</CardTitle></CardHeader>
                <CardContent><p className="leading-relaxed text-foreground">{caseData.description}</p></CardContent>
              </Card>
              {caseData.interviewNotes && (
                <Card className="border-border">
                  <CardHeader><CardTitle className="text-base text-foreground">Notas de entrevista inicial</CardTitle></CardHeader>
                  <CardContent><div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: caseData.interviewNotes }} /></CardContent>
                </Card>
              )}
              <Card className="border-border">
                <CardHeader><CardTitle className="flex items-center gap-2 text-base text-foreground"><Clock size={18} />Terminos Procesales</CardTitle></CardHeader>
                <CardContent>
                  {caseData.procesalDeadlines.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {caseData.procesalDeadlines.map((dl) => (
                        <div key={dl.id} className={`flex items-center justify-between rounded-lg border p-3 ${dl.completed ? "border-success/30 bg-success/5" : "border-border"}`}>
                          <div className="flex items-center gap-3">
                            {dl.completed ? <CheckCircle2 size={18} className="text-success" /> : <Clock size={18} className="text-muted-foreground" />}
                            <span className={`text-sm ${dl.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>{dl.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{new Date(dl.dueDate).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                      <p className="text-sm text-muted-foreground">Los terminos procesales se calculan automaticamente segun la configuracion del sistema.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              {caseData.reservedData && (
                <Card className="border-2 border-destructive/30">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-base text-foreground"><Shield size={18} className="text-destructive" />Datos de Reserva Legal</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {caseData.reservedData.hasMinor && <Badge className="bg-destructive/10 text-destructive">Menor de edad</Badge>}
                        {caseData.reservedData.hasGeneticData && <Badge className="bg-destructive/10 text-destructive">Datos geneticos</Badge>}
                        {caseData.reservedData.hasPensionData && <Badge className="bg-destructive/10 text-destructive">Datos pensionales</Badge>}
                      </div>
                      <p className="text-foreground">{caseData.reservedData.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6">
              <Card className="border-border">
                <CardHeader><CardTitle className="flex items-center gap-2 text-base text-foreground"><User size={18} />Datos del solicitante</CardTitle></CardHeader>
                <CardContent>
                  <dl className="flex flex-col gap-3 text-sm">
                    <div><dt className="text-muted-foreground">Nombre</dt><dd className="font-medium text-foreground">{caseData.clientName}</dd></div>
                    <div><dt className="text-muted-foreground">Documento</dt><dd className="font-mono text-foreground">{caseData.clientDocType} {caseData.clientDoc}</dd></div>
                    <div><dt className="text-muted-foreground">Telefono</dt><dd className="text-foreground">{caseData.clientPhone}</dd></div>
                    <div><dt className="text-muted-foreground">Correo</dt><dd className="text-foreground">{caseData.clientEmail}</dd></div>
                    <div><dt className="text-muted-foreground">Tipo</dt><dd className="text-foreground">{caseData.type} - {caseData.area}</dd></div>
                    <div><dt className="text-muted-foreground">Estudiante</dt><dd className="text-foreground">{caseData.assignedStudent}</dd></div>
                  </dl>
                </CardContent>
              </Card>

              <Card className={`border-border ${highRisk ? "border-destructive/50 bg-destructive/5" : ""}`}>
                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base text-foreground"><AlertTriangle size={18} className={highRisk ? "text-destructive" : "text-muted-foreground"} />Riesgo Juridico</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="riskToggle" className="text-sm text-foreground cursor-pointer">Marcar Riesgo Alto</Label>
                    <Switch id="riskToggle" checked={highRisk} onCheckedChange={setHighRisk} />
                  </div>
                  {highRisk && <Textarea placeholder="Justificacion del riesgo..." value={riskReason} onChange={(e) => setRiskReason(e.target.value)} className="min-h-[60px]" />}
                </CardContent>
              </Card>

              {/* === ACCIONES FUNCIONALES === */}
              <Card className={`border-2 ${currentPhase === 5 ? "border-success/30" : "border-primary/20"}`}>
                <CardHeader className="pb-3"><CardTitle className="text-base text-foreground">{currentPhase === 5 ? "Caso Cerrado" : `Acciones - Fase ${currentPhase}`}</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {currentPhase !== 5 && (
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
                      <Label htmlFor="notifyEmail" className="text-sm text-foreground cursor-pointer">Notificar por correo</Label>
                      <Switch id="notifyEmail" checked={notifyEmail} onCheckedChange={setNotifyEmail} />
                    </div>
                  )}

                  {currentPhase === 1 && (
                    <>
                      <Button className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={handlePassToReview}>
                        <ArrowRight size={16} />Pasar a Revision (Fase 2)
                      </Button>
                      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
                        <DialogTrigger asChild><Button variant="outline" className="w-full gap-2 bg-transparent"><RotateCcw size={16} />Devolver al Estudiante</Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Devolver con observaciones</DialogTitle><DialogDescription>Escriba las observaciones para el estudiante.</DialogDescription></DialogHeader>
                          <Textarea placeholder="Observaciones..." value={returnObservation} onChange={(e) => setReturnObservation(e.target.value)} className="min-h-[100px]" />
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>Cancelar</Button>
                            <Button onClick={handleReturn} disabled={!returnObservation.trim()}><RotateCcw size={16} className="mr-2" />Devolver</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {currentPhase === 2 && (
                    <>
                      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90"><CheckCircle2 size={16} />Aprobar Caso</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar aprobacion</DialogTitle>
                            <DialogDescription>Aprobar el caso <strong>{caseData.radicado}</strong> del estudiante {caseData.assignedStudent}. El caso pasara a Fase 3 - Aprobacion.{notifyEmail && " Se notificara por correo."}</DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancelar</Button>
                            <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={handleApprove}>Si, aprobar caso</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
                        <DialogTrigger asChild><Button variant="outline" className="w-full gap-2 bg-transparent"><RotateCcw size={16} />Devolver con Observaciones</Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Devolver con observaciones</DialogTitle><DialogDescription>El caso volvera a Fase 1 para que el estudiante corrija.</DialogDescription></DialogHeader>
                          <Textarea placeholder="Observaciones..." value={returnObservation} onChange={(e) => setReturnObservation(e.target.value)} className="min-h-[100px]" />
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>Cancelar</Button>
                            <Button onClick={handleReturn} disabled={!returnObservation.trim()}><RotateCcw size={16} className="mr-2" />Devolver</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {currentPhase === 3 && (
                    <>
                      <Button className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90" onClick={handlePassToFollowUp}>
                        <ArrowRight size={16} />Pasar a Seguimiento (Fase 4)
                      </Button>
                      <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={() => handleReturnToPreviousPhase("Revision del profesor", "Fase 2 - Revision")}>
                        <RotateCcw size={16} />Devolver a Revision (Fase 2)
                      </Button>
                    </>
                  )}

                  {currentPhase === 4 && (
                    <>
                      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                        <DialogTrigger asChild><Button className="w-full gap-2 bg-muted text-foreground hover:bg-muted/80"><XCircle size={16} />Cerrar Caso</Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Cerrar caso</DialogTitle><DialogDescription>Esta accion cerrara definitivamente el caso {caseData.radicado}. El caso aparecera como &quot;Cerrado&quot; en todos los dashboards.</DialogDescription></DialogHeader>
                          <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleCloseCase}><XCircle size={16} className="mr-2" />Cerrar definitivamente</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={() => handleReturnToPreviousPhase("Aprobado", "Fase 3 - Aprobacion")}>
                        <RotateCcw size={16} />Devolver a Aprobacion (Fase 3)
                      </Button>
                    </>
                  )}

                  {currentPhase === 5 && (
                    <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-center">
                      <Lock size={24} className="mx-auto mb-2 text-success" />
                      <p className="text-sm font-bold text-success">Caso Cerrado</p>
                      <p className="text-xs text-muted-foreground mt-1">Este caso ha sido cerrado definitivamente por el profesor. No hay mas acciones disponibles.</p>
                      <p className="text-xs text-muted-foreground mt-2">El caso se muestra como &quot;Cerrado&quot; en todos los dashboards del sistema.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documentos" className="mt-6">
          <div className="flex flex-col gap-4">
            {/* Upload zone for professor */}
            {currentStatus !== "Cerrado" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <div
                  className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDocDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click() }}
                  aria-label="Area de carga de archivos. Arrastra archivos o haz clic para seleccionar."
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                    isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <Upload size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isDragging ? "Suelta los archivos aqui" : "Arrastra archivos aqui o haz clic para seleccionar"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Word (DOC, DOCX), Excel (XLS, XLSX), PDF, TXT — Max 100 MB por archivo
                    </p>
                  </div>
                </div>
              </>
            )}

            {documents.map((doc) => (
              <Card key={doc.id} className="border-border">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {doc.type === "docx" ? (
                      <FileIcon size={28} className="shrink-0 text-secondary" />
                    ) : (
                      <FileText size={28} className={`shrink-0 ${doc.type === "pdf" ? "text-destructive" : "text-success"}`} />
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
                        {doc.size} | {doc.uploadedBy} | {new Date(doc.uploadDate).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Ver ${doc.name}`}>
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Descargar ${doc.name}`}>
                      <Download size={16} />
                    </Button>
                    {/* Dar VoBo - only for non-approved docs, not when case is closed */}
                    {!doc.isApproved && currentStatus !== "Cerrado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs bg-transparent text-success border-success/30 hover:bg-success/10"
                        onClick={() => handleApproveDocument(doc.id)}
                        aria-label={`Dar VoBo a ${doc.name}`}
                      >
                        <ThumbsUp size={14} />
                        <span className="hidden sm:inline">Dar VoBo</span>
                      </Button>
                    )}
                    {/* Delete - only for non-approved docs, not when case is closed */}
                    {!doc.isApproved && currentStatus !== "Cerrado" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          setDocToDelete(doc.id)
                          setShowDeleteDocDialog(true)
                        }}
                        aria-label={`Eliminar ${doc.name}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Auditoria (Dynamic) */}
        <TabsContent value="auditoria" className="mt-6">
          <Card className="border-border">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base text-foreground"><Shield size={18} />Historial de Auditoria ({auditLog.length} registros)</CardTitle></CardHeader>
            <CardContent>
              <div className="relative flex flex-col gap-0">
                {auditLog.map((entry, i) => (
                  <div key={entry.id} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < auditLog.length - 1 && <div className="absolute left-[15px] top-8 h-full w-px bg-border" />}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${entry.role === "profesor" ? "bg-primary/10" : entry.role === "administrativo" ? "bg-accent/10" : "bg-muted"}`}>
                      <Clock size={14} className="text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-foreground"><span className="font-semibold">{entry.user}</span> <span className="text-xs text-muted-foreground">({entry.role})</span> {entry.action}</p>
                      {entry.detail && <p className="text-xs text-muted-foreground">{entry.detail}</p>}
                      <p className="text-xs text-muted-foreground">{entry.date}, {entry.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat (Functional) */}
        <TabsContent value="chat" className="mt-6">
          <Card className="border-border">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="mb-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
                <p className="text-sm font-medium text-foreground">Chat con: <span className="text-primary">{caseData.assignedStudent}</span></p>
                <p className="text-xs text-muted-foreground">Las observaciones y mensajes son visibles para ambos.</p>
              </div>
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
                {chatMessages.map((comment) => {
                  const isProfessor = comment.role === "Profesor"
                  return (
                    <div key={comment.id} className={`flex gap-3 ${isProfessor ? "" : "flex-row-reverse"}`}>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{comment.avatar}</div>
                      <div className={`flex max-w-[75%] flex-col gap-1 rounded-lg p-3 ${isProfessor ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{comment.user}</span>
                          <span className={`text-xs ${isProfessor ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{comment.role}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.message}</p>
                        {comment.hasAttachment && (
                          <div className={`mt-1 flex items-center gap-2 rounded px-2 py-1 text-xs ${isProfessor ? "bg-primary-foreground/10" : "bg-card"}`}>
                            <Paperclip size={12} />{comment.attachmentName}
                          </div>
                        )}
                        <span className={`text-xs ${isProfessor ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{comment.timestamp}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3 border-t border-border pt-4">
                <div className="flex flex-1 flex-col gap-2">
                  <Textarea placeholder="Escriba observaciones o mensajes para el estudiante..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="min-h-[80px] resize-none" />
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground"><Paperclip size={16} />Adjuntar</Button>
                    <Button size="sm" className="flex items-center gap-2" onClick={handleSendMessage} disabled={!newComment.trim()}><Send size={14} />Enviar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {caseData.substitutionHistory.length > 0 && (
          <TabsContent value="sustitucion" className="mt-6">
            <Card className="border-border">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base text-foreground"><ArrowRightLeft size={18} />Historial de Sustitucion</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {caseData.substitutionHistory.map((sub, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-accent/15 text-accent-foreground">Sustitucion #{i + 1}</Badge>
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

      {/* Delete Document Dialog */}
      <Dialog open={showDeleteDocDialog} onOpenChange={setShowDeleteDocDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar Documento</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. El documento sera eliminado permanentemente del expediente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDocDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument}>
              <Trash2 size={14} className="mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
