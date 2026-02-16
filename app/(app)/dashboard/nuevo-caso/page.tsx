"use client"

import React from "react"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Upload,
  X,
  FileText,
  FileIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Shield,
  Bold,
  Italic,
  Underline,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// RF-05 flow: steps now include interview notes
const steps = [
  { number: 1, title: "Informacion Basica" },
  { number: 2, title: "Datos del Solicitante" },
  { number: 3, title: "Notas de Entrevista" },
  { number: 4, title: "Carga de Documentos" },
]

interface UploadedFile {
  name: string
  size: string
  type: "pdf" | "docx" | "image"
  progress: number
}

export default function NuevoCasoPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isMinor, setIsMinor] = useState(false)
  const [useAI, setUseAI] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiTags, setAiTags] = useState<{ label: string; confidence: number }[]>([])

  // RF-27: Reserved legal data
  const [hasGeneticData, setHasGeneticData] = useState(false)
  const [hasPensionData, setHasPensionData] = useState(false)
  const [reservedNotes, setReservedNotes] = useState("")

  // RF-22: Rich text editor state
  const [interviewNotes, setInterviewNotes] = useState("")

  // "Otros" custom values for selects
  const [caseType, setCaseType] = useState("")
  const [customCaseType, setCustomCaseType] = useState("")
  const [area, setArea] = useState("")
  const [customArea, setCustomArea] = useState("")

  const [files, setFiles] = useState<UploadedFile[]>([
    { name: "poder_notariado.pdf", size: "1.2 MB", type: "pdf", progress: 100 },
    { name: "cedula_frente.jpg", size: "450 KB", type: "image", progress: 100 },
  ])

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const newFiles = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
      type: (f.type.includes("word") || f.name.endsWith(".docx")
        ? "docx"
        : f.type.includes("image")
          ? "image"
          : "pdf") as UploadedFile["type"],
      progress: 100,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: f.size >= 1024 * 1024 ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
        type: (f.type.includes("word") || f.name.endsWith(".docx")
          ? "docx"
          : f.type.includes("image")
            ? "image"
            : "pdf") as UploadedFile["type"],
        progress: 100,
      }))
      setFiles((prev) => [...prev, ...newFiles])
      e.target.value = ""
    }
  }

  // RF-10/RF-26: Simulated AI analysis
  const simulateAIAnalysis = useCallback(() => {
    setAiAnalyzing(true)
    setTimeout(() => {
      setAiTags([
        { label: "Despido injustificado", confidence: 0.95 },
        { label: "Derechos laborales", confidence: 0.9 },
        { label: "Liquidacion", confidence: 0.85 },
      ])
      setAiAnalyzing(false)
    }, 2000)
  }, [])

  const generatedRadicado = `SICOP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`

  return (
    <div className="mx-auto max-w-3xl">
      {/* Step Indicator */}
      <div className="mb-6">
        <nav aria-label="Progreso del formulario">
          <ol className="flex items-center gap-2">
            {steps.map((step, i) => (
              <li key={step.number} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    currentStep >= step.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  aria-current={currentStep === step.number ? "step" : undefined}
                >
                  {currentStep > step.number ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`hidden text-sm sm:inline ${
                    currentStep >= step.number
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-2 h-px w-8 sm:w-12 ${
                      currentStep > step.number ? "bg-primary" : "bg-border"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Nuevo Expediente Digital - Paso {currentStep} de {steps.length}
          </CardTitle>
          {/* RF-02: Unique radicado */}
          <p className="font-mono text-sm text-muted-foreground">
            Radicado asignado: <span className="font-semibold text-primary">{generatedRadicado}</span>
          </p>
        </CardHeader>
        <CardContent>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="caseType" className="text-base">
                  Tipo de Actuacion
                </Label>
                <Select value={caseType} onValueChange={setCaseType}>
                  <SelectTrigger id="caseType" className="h-12">
                    <SelectValue placeholder="Seleccione el tipo de actuacion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutela">Tutela</SelectItem>
                    <SelectItem value="demanda">Demanda</SelectItem>
                    <SelectItem value="derecho-peticion">Derecho de peticion</SelectItem>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="Descargos">Descargos</SelectItem>
                    <SelectItem value="alegatos precalificatorios">Alegatos precalificatorios</SelectItem>
                    <SelectItem value="alegato de conclusion">Alegato de conclusion</SelectItem>
                    <SelectItem value="nulidades">Nulidades</SelectItem>
                    <SelectItem value="Recurso">Recurso</SelectItem>
                    <SelectItem value="demanda de cumplimiento">Demanda de cumplimiento</SelectItem>
                    <SelectItem value="liquidación">Liquidacion</SelectItem>
                    <SelectItem value="seguridad social">Seguridad Social</SelectItem>
                    <SelectItem value="pensiones">Pensiones</SelectItem>
                    <SelectItem value="conciliación">Conciliacion</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
                {caseType === "otros" && (
                  <Input
                    placeholder="Especifique el tipo de actuacion"
                    className="h-12"
                    value={customCaseType}
                    onChange={(e) => setCustomCaseType(e.target.value)}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="area" className="text-base">
                  Area juridica
                </Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger id="area" className="h-12">
                    <SelectValue placeholder="Seleccione el area juridica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="penal">Penal</SelectItem>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="laboral">Laboral</SelectItem>
                    <SelectItem value="familia">Familia</SelectItem>
                    <SelectItem value="publico">Derecho Publico</SelectItem>
                    <SelectItem value="derecho disciplinario">Derecho Disciplinario</SelectItem>
                    <SelectItem value="responsabilidad fiscal">Responsabilidad Fiscal</SelectItem>
                    <SelectItem value="constitucional">Constitucional</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="sucesiones">Sucesiones</SelectItem>
                    <SelectItem value="conciliación">Conciliacion</SelectItem>
                    <SelectItem value="transito">Transito</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
                {area === "otros" && (
                  <Input
                    placeholder="Especifique el area juridica"
                    className="h-12"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="radicadoExt" className="text-base">
                  Radicado externo{" "}
                  <span className="text-sm font-normal text-muted-foreground">(si aplica)</span>
                </Label>
                <Input
                  id="radicadoExt"
                  placeholder="Ej: 2024-00123"
                  className="h-12 font-mono"
                />
              </div>

              {/* Terminos procesales - placeholder */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Los terminos procesales se calcularan automaticamente segun la configuracion del sistema.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Client Data */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="docType" className="text-base">
                    Tipo de documento <span className="text-destructive">*</span>
                  </Label>
                  <Select>
                    <SelectTrigger id="docType" className="h-12">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cc">Cedula de Ciudadania</SelectItem>
                      <SelectItem value="ce">Cedula de Extranjeria</SelectItem>
                      <SelectItem value="ti">Tarjeta de Identidad (T.I.)</SelectItem>
                      <SelectItem value="pasaporte">Pasaporte</SelectItem>
                      <SelectItem value="nit">NIT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="docNumber" className="text-base">
                    Numero de documento <span className="text-destructive">*</span>
                  </Label>
                  <Input id="docNumber" placeholder="Ej: 1023456789" className="h-12 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="firstName" className="text-base">
                    Nombres <span className="text-destructive">*</span>
                  </Label>
                  <Input id="firstName" placeholder="Ej: Juan Carlos" className="h-12" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lastName" className="text-base">
                    Apellidos <span className="text-destructive">*</span>
                  </Label>
                  <Input id="lastName" placeholder="Ej: Rodriguez Lopez" className="h-12" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="text-base">
                    Telefono <span className="text-destructive">*</span>
                  </Label>
                  <Input id="phone" type="tel" placeholder="Ej: 3101234567" className="h-12" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="clientEmail" className="text-base">
                    Correo electronico <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="h-12"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="address" className="text-base">
                  Direccion{" "}
                  <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
                </Label>
                <Input id="address" placeholder="Direccion de residencia" className="h-12" />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="isMinor"
                  checked={isMinor}
                  onCheckedChange={(checked) => setIsMinor(checked === true)}
                />
                <Label htmlFor="isMinor" className="text-base font-normal cursor-pointer">
                  Es menor de edad
                </Label>
              </div>

              {isMinor && (
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-4">
                  <Label htmlFor="guardian" className="text-base">
                    Nombre del tutor legal
                  </Label>
                  <Input
                    id="guardian"
                    placeholder="Nombre completo del tutor o representante legal"
                    className="h-12"
                  />
                </div>
              )}

              {/* RF-27: Reserved Legal Data */}
              <div className="flex flex-col gap-4 rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-center gap-2">
                  <Shield size={20} className="text-destructive" aria-hidden="true" />
                  <span className="text-base font-semibold text-foreground">
                    Datos de Reserva Legal
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Estos datos son de acceso restringido. Solo seran visibles para el estudiante asignado y su profesor.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="geneticData"
                      checked={hasGeneticData}
                      onCheckedChange={(checked) => setHasGeneticData(checked === true)}
                    />
                    <Label htmlFor="geneticData" className="text-sm font-normal cursor-pointer">
                      Contiene datos geneticos
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="pensionData"
                      checked={hasPensionData}
                      onCheckedChange={(checked) => setHasPensionData(checked === true)}
                    />
                    <Label htmlFor="pensionData" className="text-sm font-normal cursor-pointer">
                      Contiene datos pensionales
                    </Label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reservedNotes" className="text-sm">
                      Notas de reserva legal
                    </Label>
                    <Textarea
                      id="reservedNotes"
                      placeholder="Descripcion de datos sensibles (menores, datos geneticos, pensionales)..."
                      value={reservedNotes}
                      onChange={(e) => setReservedNotes(e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <p className="text-sm text-foreground">
                  <span className="font-medium">Datos Sensibles:</span> Esta informacion esta
                  protegida por la Ley 1581 de 2012 (Habeas Data). Solo sera utilizada con fines
                  legales dentro del consultorio juridico.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: RF-22 Rich Text Editor for Interview Notes + Concepto Juridico */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-5">
              {/* Nuevo Expediente Digital - Editor de entrevista */}
              <div className="flex flex-col gap-2">
                <Label className="text-base">Nuevo Expediente Digital - Notas de la entrevista inicial</Label>
                <p className="text-sm text-muted-foreground">
                  Utilice el editor para registrar los hechos relevantes de la entrevista con el solicitante.
                  Solo se permiten formatos basicos: negrita, cursiva y subrayado. Sin cambio de colores ni tipografia.
                </p>
              </div>

              {/* Rich text editor with contentEditable */}
              <div className="rounded-lg border border-border">
                <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 px-2 py-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background"
                    onClick={() => document.execCommand("bold", false)}
                    aria-label="Negrita"
                  >
                    <Bold size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background"
                    onClick={() => document.execCommand("italic", false)}
                    aria-label="Cursiva"
                  >
                    <Italic size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background"
                    onClick={() => document.execCommand("underline", false)}
                    aria-label="Subrayado"
                  >
                    <Underline size={16} />
                  </Button>
                </div>
                <div
                  contentEditable
                  spellCheck={true}
                  className="min-h-[200px] w-full resize-y bg-card p-4 font-serif text-base leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-primary/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
                  data-placeholder="Describa los hechos relevantes de la entrevista inicial. Incluya fechas, personas involucradas, pretensiones del solicitante y cualquier dato relevante para el caso..."
                  onInput={(e) => setInterviewNotes((e.target as HTMLDivElement).innerHTML)}
                  role="textbox"
                  aria-label="Editor de notas de entrevista"
                  aria-multiline="true"
                  onPaste={(e) => {
                    e.preventDefault()
                    const text = e.clipboardData.getData("text/plain")
                    document.execCommand("insertText", false, text)
                  }}
                />
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <Shield size={20} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  Incluya detalles como: fecha de los hechos, relacion entre las partes, pretensiones especificas y documentos que el solicitante mencione tener.
                  Correccion ortografica automatica habilitada. Sin limite de caracteres.
                </p>
              </div>

              {/* Concepto o Actuacion Juridica */}
              <div className="flex flex-col gap-2 mt-4">
                <Label className="text-base">Concepto o Actuacion Juridica</Label>
                <p className="text-sm text-muted-foreground">
                  Redacte el concepto juridico utilizando terminologia de derecho. Mismo formato: solo negrita, cursiva y subrayado.
                </p>
              </div>

              <div className="rounded-lg border border-border">
                <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 px-2 py-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background"
                    onClick={() => document.execCommand("bold", false)}
                    aria-label="Negrita"
                  >
                    <Bold size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background"
                    onClick={() => document.execCommand("italic", false)}
                    aria-label="Cursiva"
                  >
                    <Italic size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-background"
                    onClick={() => document.execCommand("underline", false)}
                    aria-label="Subrayado"
                  >
                    <Underline size={16} />
                  </Button>
                </div>
                <div
                  contentEditable
                  spellCheck={true}
                  className="min-h-[200px] w-full resize-y bg-card p-4 font-serif text-base leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-primary/20 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
                  data-placeholder="Escriba el concepto o actuacion juridica correspondiente al caso. Utilice terminologia juridica apropiada..."
                  role="textbox"
                  aria-label="Editor de concepto juridico"
                  aria-multiline="true"
                  onPaste={(e) => {
                    e.preventDefault()
                    const text = e.clipboardData.getData("text/plain")
                    document.execCommand("insertText", false, text)
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 4: Documents (RF-03 PDF/Word, RF-10 AI, RF-26 AI Tags) */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-5">
              {/* RF-03: Drag & Drop Zone */}
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
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click() }}
                aria-label="Area de carga de archivos. Arrastra archivos aqui o haz clic para seleccionar."
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                  isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Upload size={32} />
                </div>
                <p className="text-base font-medium text-foreground">
                  {isDragging ? "Suelta los archivos aqui" : "Arrastra archivos aqui o haz clic para seleccionar"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Formatos aceptados: PDF, Word (DOC, DOCX), Excel (XLS, XLSX), TXT (Max 100 MB)
                </p>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText size={16} aria-hidden="true" />
                    <span className="text-xs">PDF</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileIcon size={16} aria-hidden="true" />
                    <span className="text-xs">DOC/DOCX</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileSpreadsheet size={16} aria-hidden="true" />
                    <span className="text-xs">XLS/XLSX</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={16} aria-hidden="true" />
                    <span className="text-xs">TXT</span>
                  </div>
                </div>
              </div>

              {/* Uploaded files */}
              {files.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium text-foreground">
                    Archivos cargados ({files.length})
                  </h3>
                  {files.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <FileText
                        size={20}
                        className={`shrink-0 ${
                          file.type === "pdf"
                            ? "text-destructive"
                            : file.type === "docx"
                              ? "text-secondary"
                              : "text-success"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="text-sm font-medium text-foreground">{file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{file.size}</span>
                          <Badge variant="secondary" className="text-xs">
                            {file.type.toUpperCase()}
                          </Badge>
                        </div>
                        {file.progress < 100 && (
                          <Progress value={file.progress} className="h-1.5" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFile(i)}
                        aria-label={`Eliminar archivo ${file.name}`}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  Atras
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="bg-transparent text-muted-foreground"
              >
                Cancelar
              </Button>
            </div>

            <div className="flex gap-2">
              {currentStep === steps.length && (
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Save size={16} aria-hidden="true" />
                  Guardar como borrador
                </Button>
              )}
              {currentStep < steps.length ? (
                <Button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight size={16} aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Check size={16} aria-hidden="true" />
                  Crear Expediente
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RF-02: Confirm creation dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar creacion de expediente</DialogTitle>
            <DialogDescription>
              Se creara el expediente digital con radicado{" "}
              <span className="font-mono font-semibold">{generatedRadicado}</span>. El caso
              quedara en estado <span className="font-semibold">Evaluacion</span> y sera
              notificado al profesor asignado segun el area juridica seleccionada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              Si, crear expediente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
