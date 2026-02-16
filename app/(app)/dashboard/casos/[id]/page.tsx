"use client"

import { use, useState, useRef, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Send,
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
  Upload,
  Trash2,
  X,
  Plus,
  MessageSquare,
  Edit,
  XCircle,
  Bold,
  Italic,
  Underline,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Semaphore } from "@/components/semaphore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { mockCases, mockComments, getPhaseFromStatus, getSemaphoreFromDeadline } from "@/lib/mock-data"
import type { CaseType, CaseArea, ProcesalDeadline } from "@/lib/mock-data"

const PHASE_LABELS = ["Evaluacion", "Revision", "Aprobacion", "Seguimiento"]

const tabTriggerClass =
  "rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const caseData = mockCases.find((c) => c.id === id) || mockCases[0]

  // Current phase (1-4)
  const currentPhase = getPhaseFromStatus(caseData.status)
  const currentStepIndex = currentPhase - 1

  // ── Editable state ──────────────────────────────────────────────────
  const [description, setDescription] = useState(caseData.description)
  const [interviewNotes, setInterviewNotes] = useState(caseData.interviewNotes || "")
  const [clientName, setClientName] = useState(caseData.clientName)
  const [clientDoc, setClientDoc] = useState(caseData.clientDoc)
  const [clientDocType, setClientDocType] = useState(caseData.clientDocType)
  const [clientPhone, setClientPhone] = useState(caseData.clientPhone)
  const [clientEmail, setClientEmail] = useState(caseData.clientEmail)
  const [clientAddress, setClientAddress] = useState(caseData.clientAddress)
  const [caseType, setCaseType] = useState<CaseType>(caseData.type)
  const [caseArea, setCaseArea] = useState<CaseArea>(caseData.area)
  const [hoursSpent, setHoursSpent] = useState(String(caseData.hoursSpent))
  const [deadlines, setDeadlines] = useState<ProcesalDeadline[]>([...caseData.procesalDeadlines])

  // Reserved data
  const [hasMinor, setHasMinor] = useState(caseData.reservedData?.hasMinor || false)
  const [hasGeneticData, setHasGeneticData] = useState(caseData.reservedData?.hasGeneticData || false)
  const [hasPensionData, setHasPensionData] = useState(caseData.reservedData?.hasPensionData || false)
  const [reservedNotes, setReservedNotes] = useState(caseData.reservedData?.notes || "")

  // Concepto Juridico
  const [conceptoJuridico, setConceptoJuridico] = useState("")

  // Refs for rich text editors
  const interviewEditorRef = useRef<HTMLDivElement>(null)
  const conceptoEditorRef = useRef<HTMLDivElement>(null)

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)

  // Documents
  const [documents, setDocuments] = useState(caseData.documents)
  const [showDeleteDocDialog, setShowDeleteDocDialog] = useState(false)
  const [docToDelete, setDocToDelete] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Chat
  const [newComment, setNewComment] = useState("")
  const [chatMessages, setChatMessages] = useState(mockComments)

  // Feedback
  const [showSaveToast, setShowSaveToast] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)

  const statusColor: Record<string, string> = {
    Evaluacion: "bg-muted text-muted-foreground",
    Sustanciacion: "bg-accent/15 text-accent-foreground",
    "Revision del profesor": "bg-secondary/15 text-secondary",
    Aprobado: "bg-success/15 text-success",
    Seguimiento: "bg-primary/15 text-primary",
    Cerrado: "bg-muted text-muted-foreground",
  }

  // Rich text formatting helper
  const execFormat = useCallback((command: string) => {
    document.execCommand(command, false)
  }, [])

  // Toolbar component for rich text editors
  function RichTextToolbar({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) {
    const handleFormat = (command: string) => {
      // Ensure focus is in the editor before applying format
      if (editorRef.current) {
        editorRef.current.focus()
      }
      execFormat(command)
    }
    return (
      <div className="flex items-center gap-1 rounded-t-lg border border-b-0 border-border bg-muted/50 px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-background"
          onClick={() => handleFormat("bold")}
          aria-label="Negrita"
          title="Negrita"
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-background"
          onClick={() => handleFormat("italic")}
          aria-label="Cursiva"
          title="Cursiva"
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-background"
          onClick={() => handleFormat("underline")}
          aria-label="Subrayado"
          title="Subrayado"
        >
          <Underline size={16} />
        </Button>
      </div>
    )
  }

  // Check if case was returned by professor (has "Devolvio" in audit)
  const lastReturnEntry = [...caseData.auditLog]
    .reverse()
    .find((e) => e.action.toLowerCase().includes("devolvio") || e.action.toLowerCase().includes("devolver"))

  // Can student edit? Only in phases 1 and 2 (Evaluacion, Sustanciacion, Revision del profesor)
  const canStartEditing = currentPhase <= 2
  const canEdit = canStartEditing && isEditing

  function addDeadline() {
    setDeadlines((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, name: "", dueDate: "", completed: false },
    ])
  }

  function removeDeadline(index: number) {
    setDeadlines((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    setIsEditing(false)
    setShowSaveToast(true)
    setTimeout(() => setShowSaveToast(false), 3000)
  }

  function handleSendToReview() {
    setShowSendDialog(false)
    setShowSaveToast(true)
    setTimeout(() => setShowSaveToast(false), 3000)
  }

  function handleDeleteDocument() {
    if (!docToDelete) return
    setDocuments((prev) => prev.filter((d) => d.id !== docToDelete))
    setDocToDelete(null)
    setShowDeleteDocDialog(false)
    setShowSaveToast(true)
    setTimeout(() => setShowSaveToast(false), 3000)
  }

  function processFiles(fileList: FileList) {
    const ALLOWED = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"]
    const MAX_SIZE = 100 * 1024 * 1024 // 100 MB
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
          uploadedBy: "Maria Gonzalez",
          uploadDate: new Date().toISOString().split("T")[0],
          isApproved: false,
          version: 1,
        }
      })
    if (newDocs.length > 0) {
      setDocuments((prev) => [...prev, ...newDocs])
      setShowSaveToast(true)
      setTimeout(() => setShowSaveToast(false), 3000)
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

  function handleSendChat() {
    if (!newComment.trim()) return
    setChatMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        user: "Maria Gonzalez",
        role: "Estudiante",
        avatar: "MG",
        message: newComment,
        timestamp: "Ahora",
      },
    ])
    setNewComment("")
  }

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
            <Badge className={statusColor[caseData.status] || ""}>Fase {currentPhase} - {PHASE_LABELS[currentStepIndex]}</Badge>
            {caseData.highRiskAlert && (
              <Badge className="bg-destructive/15 text-destructive">
                <AlertTriangle size={12} className="mr-1" aria-hidden="true" />
                Riesgo Alto
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Semaphore color={getSemaphoreFromDeadline(caseData.deadline)} size="lg" showLabel />
            <span className="text-sm text-muted-foreground">
              {new Date(caseData.deadline).toLocaleDateString("es-CO", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canStartEditing && !isEditing && (
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent" onClick={() => setIsEditing(true)}>
              <Edit size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Editar caso</span>
              <span className="sm:hidden">Editar</span>
            </Button>
          )}
          {canEdit && (
            <>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground" onClick={() => setIsEditing(false)}>
                <XCircle size={14} aria-hidden="true" />
                Cancelar
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent" onClick={handleSave}>
                <Save size={14} aria-hidden="true" />
                <span className="hidden sm:inline">Guardar cambios</span>
                <span className="sm:hidden">Guardar</span>
              </Button>
            </>
          )}
          {canStartEditing && (
            <Button size="sm" className="flex items-center gap-2" onClick={() => setShowSendDialog(true)}>
              <Send size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Enviar a revision</span>
              <span className="sm:hidden">Enviar</span>
            </Button>
          )}
          {!canStartEditing && (
            <Badge variant="secondary" className="bg-success/10 text-success">
              <Lock size={12} className="mr-1" />
              Caso en fase {currentPhase} - Solo lectura
            </Badge>
          )}
        </div>
      </div>

      {/* Professor Observations Banner */}
      {lastReturnEntry && canStartEditing && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg border border-secondary/30 bg-secondary/10 p-4"
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="shrink-0 text-secondary" aria-hidden="true" />
            <span className="font-semibold text-secondary">Observaciones del Profesor</span>
            <span className="text-xs text-muted-foreground">({lastReturnEntry.date})</span>
          </div>
          <p className="text-sm text-foreground">
            <span className="font-medium">{lastReturnEntry.user}:</span>{" "}
            {lastReturnEntry.detail || lastReturnEntry.action}
          </p>
          <p className="text-xs text-muted-foreground">
            Corrija las observaciones y envie nuevamente a revision.
          </p>
        </div>
      )}

      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 shadow-lg">
          <CheckCircle2 size={18} className="text-success" />
          <span className="text-sm font-medium text-success">Cambios guardados correctamente</span>
        </div>
      )}

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
          <TabsTrigger value="solicitante" className={tabTriggerClass}>
            Solicitante
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

        {/* Tab: Resumen (editable) */}
        <TabsContent value="resumen" className="mt-6">
          <div className="flex flex-col gap-6">
            {/* Case Type & Area */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="caseType" className="text-sm font-medium text-foreground">Tipo de actuación</Label>
                {canEdit ? (
                  <Select value={caseType} onValueChange={(v) => setCaseType(v as CaseType)}>
                    <SelectTrigger id="caseType" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tutela">Tutela</SelectItem>
                      <SelectItem value="Demanda">Demanda</SelectItem>
                      <SelectItem value="Derecho de peticion">Derecho de peticion</SelectItem>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-foreground rounded-lg border border-border bg-muted/30 px-3 py-2">{caseType}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="caseArea" className="text-sm font-medium text-foreground">Area juridica</Label>
                {canEdit ? (
                  <Select value={caseArea} onValueChange={(v) => setCaseArea(v as CaseArea)}>
                    <SelectTrigger id="caseArea" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Penal">Penal</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="Laboral">Laboral</SelectItem>
                      <SelectItem value="Familia">Familia</SelectItem>
                      <SelectItem value="Derecho Publico">Derecho Publico</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-foreground rounded-lg border border-border bg-muted/30 px-3 py-2">{caseArea}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">Descripcion del conflicto</Label>
              {canEdit ? (
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px] resize-y"
                  placeholder="Describa el conflicto juridico..."
                />
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-sm leading-relaxed text-foreground">{description}</p>
                </div>
              )}
            </div>

            {/* Interview Notes */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="interviewNotes" className="text-sm font-medium text-foreground">Notas de entrevista inicial</Label>
              {canEdit ? (
                <div>
                  <RichTextToolbar editorRef={interviewEditorRef} />
                  <div
                    ref={interviewEditorRef}
                    id="interviewNotes"
                    contentEditable
                    spellCheck={true}
                    className="min-h-[120px] rounded-b-lg border border-border bg-background p-3 font-serif text-sm leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    dangerouslySetInnerHTML={{ __html: interviewNotes }}
                    onInput={(e) => setInterviewNotes((e.target as HTMLDivElement).innerHTML)}
                    role="textbox"
                    aria-label="Notas de entrevista inicial"
                    aria-multiline="true"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  {interviewNotes ? (
                    <div className="prose prose-sm max-w-none font-serif text-foreground" dangerouslySetInnerHTML={{ __html: interviewNotes }} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin notas de entrevista</p>
                  )}
                </div>
              )}
            </div>

            {/* Concepto o Actuacion Juridica */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="conceptoJuridico" className="text-sm font-medium text-foreground">Concepto o Actuacion Juridica</Label>
              <p className="text-xs text-muted-foreground">Documento de actuacion juridica con terminologia especializada</p>
              {canEdit ? (
                <div>
                  <RichTextToolbar editorRef={conceptoEditorRef} />
                  <div
                    ref={conceptoEditorRef}
                    id="conceptoJuridico"
                    contentEditable
                    spellCheck={true}
                    className="min-h-[120px] rounded-b-lg border border-border bg-background p-3 font-serif text-sm leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    dangerouslySetInnerHTML={{ __html: conceptoJuridico }}
                    onInput={(e) => setConceptoJuridico((e.target as HTMLDivElement).innerHTML)}
                    role="textbox"
                    aria-label="Concepto o Actuacion Juridica"
                    aria-multiline="true"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  {conceptoJuridico ? (
                    <div className="prose prose-sm max-w-none font-serif text-foreground" dangerouslySetInnerHTML={{ __html: conceptoJuridico }} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin concepto juridico</p>
                  )}
                </div>
              )}
            </div>

            {/* Terminos Procesales - Automaticos */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <Clock size={18} aria-hidden="true" />
                  Terminos Procesales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deadlines.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {deadlines.map((dl) => (
                      <div
                        key={dl.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          dl.completed ? "border-success/30 bg-success/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {dl.completed ? (
                            <CheckCircle2 size={18} className="text-success shrink-0" />
                          ) : (
                            <Clock size={18} className="text-muted-foreground shrink-0" />
                          )}
                          <span className={`text-sm ${dl.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                            {dl.name}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(dl.dueDate).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Los terminos procesales se calculan automaticamente segun la configuracion del sistema.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reserved Data */}
            <Card className="border-2 border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <Shield size={18} className="text-destructive" aria-hidden="true" />
                  Datos de Reserva Legal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {canEdit ? (
                    <>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox id="hasMinor" checked={hasMinor} onCheckedChange={(c) => setHasMinor(c === true)} />
                          <Label htmlFor="hasMinor" className="text-sm font-normal cursor-pointer">Menor de edad</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="hasGenetic" checked={hasGeneticData} onCheckedChange={(c) => setHasGeneticData(c === true)} />
                          <Label htmlFor="hasGenetic" className="text-sm font-normal cursor-pointer">Datos geneticos</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="hasPension" checked={hasPensionData} onCheckedChange={(c) => setHasPensionData(c === true)} />
                          <Label htmlFor="hasPension" className="text-sm font-normal cursor-pointer">Datos pensionales</Label>
                        </div>
                      </div>
                      <Textarea
                        value={reservedNotes}
                        onChange={(e) => setReservedNotes(e.target.value)}
                        placeholder="Notas de reserva legal..."
                        className="min-h-[60px]"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {hasMinor && <Badge className="bg-destructive/10 text-destructive">Menor de edad</Badge>}
                        {hasGeneticData && <Badge className="bg-destructive/10 text-destructive">Datos geneticos</Badge>}
                        {hasPensionData && <Badge className="bg-destructive/10 text-destructive">Datos pensionales</Badge>}
                        {!hasMinor && !hasGeneticData && !hasPensionData && (
                          <span className="text-sm text-muted-foreground">Sin datos de reserva</span>
                        )}
                      </div>
                      {reservedNotes && <p className="text-sm text-foreground">{reservedNotes}</p>}
                    </>
                  )}
                  <p className="text-xs text-destructive">
                    Solo visible para: {caseData.assignedStudent} y {caseData.assignedProfessor}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={14} />
              Profesor asignado: <span className="font-medium text-foreground">{caseData.assignedProfessor}</span>
              &nbsp;|&nbsp; Creado: {caseData.createdAt}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Solicitante (editable) */}
        <TabsContent value="solicitante" className="mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <User size={18} aria-hidden="true" />
                Datos del Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="clientName">Nombre completo</Label>
                      <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} className="h-10" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="clientDocType">Tipo de documento</Label>
                      <Select value={clientDocType} onValueChange={setClientDocType}>
                        <SelectTrigger id="clientDocType" className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC">Cedula de Ciudadania</SelectItem>
                          <SelectItem value="CE">Cedula de Extranjeria</SelectItem>
                          <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                          <SelectItem value="NIT">NIT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="clientDoc">Numero de documento</Label>
                      <Input id="clientDoc" value={clientDoc} onChange={(e) => setClientDoc(e.target.value)} className="h-10 font-mono" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="clientPhone">Telefono</Label>
                      <Input id="clientPhone" type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="h-10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="clientEmailInput">Correo electronico</Label>
                      <Input id="clientEmailInput" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="h-10" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="clientAddress">Direccion</Label>
                      <Input id="clientAddress" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="h-10" />
                    </div>
                  </div>
                </div>
              ) : (
                <dl className="flex flex-col gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Nombre</dt>
                    <dd className="font-medium text-foreground">{clientName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Documento</dt>
                    <dd className="font-mono text-foreground">{clientDocType} {clientDoc}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Telefono</dt>
                    <dd className="text-foreground">{clientPhone}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Correo</dt>
                    <dd className="text-foreground">{clientEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Direccion</dt>
                    <dd className="text-foreground">{clientAddress}</dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Documentos */}
        <TabsContent value="documentos" className="mt-6">
          <div className="flex flex-col gap-4">
            {/* Upload zone (only in edit mode) */}
            {canEdit && (
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
                        {new Date(doc.uploadDate).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
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
                    {canStartEditing && doc.type === "docx" && !doc.isApproved && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs bg-transparent">
                        <FileIcon size={14} />
                        Reemplazar
                      </Button>
                    )}
                    {canStartEditing && !doc.isApproved && (
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
                      <div className="absolute left-[15px] top-8 h-full w-px bg-border" aria-hidden="true" />
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
                {chatMessages.map((comment) => {
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
                    placeholder="Escribe un mensaje..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                    aria-label="Escribir nuevo mensaje"
                  />
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
                      <Paperclip size={16} aria-hidden="true" />
                      Adjuntar archivo
                    </Button>
                    <Button size="sm" className="flex items-center gap-2" onClick={handleSendChat}>
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

      {/* Send to Review Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar a Revision</DialogTitle>
            <DialogDescription>
              El caso <span className="font-mono font-semibold">{caseData.radicado}</span> sera
              enviado al profesor <span className="font-semibold">{caseData.assignedProfessor}</span> para
              su revision. Asegurese de haber guardado todos los cambios.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancelar</Button>
            <Button onClick={handleSendToReview}>
              <Send size={14} className="mr-2" />
              Confirmar envio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
