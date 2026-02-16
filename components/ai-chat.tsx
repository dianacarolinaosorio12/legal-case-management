"use client"

import React, { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Paperclip, Bot, User, FileText, Sparkles, History, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  file?: {
    name: string
    type: string
  }
}

const initialMessage: Message = {
  id: "welcome",
  role: "assistant",
  content: "¡Hola! Soy tu asistente virtual de IA. Estoy aquí para ayudarte a analizar documentos, resumir información y responder tus preguntas sobre los archivos que compartas. ¿En qué puedo ayudarte hoy?",
  timestamp: new Date(),
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [resubirFile, setResubirFile] = useState<{ id: string; name: string; type: string } | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<string | null>(null)
  const [eliminadoId, setEliminadoId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [inputValue, setInputValue] = useState("")
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; type: string; date: Date }[]>([
    { id: "1", name: "contrato_trabajo.pdf", type: "application/pdf", date: new Date("2026-02-10") },
    { id: "2", name: "acta_constitutiva.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", date: new Date("2026-02-08") },
    { id: "3", name: "demanda_civil.pdf", type: "application/pdf", date: new Date("2026-02-05") },
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim() && !attachedFile) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue || (attachedFile ? `Archivo: ${attachedFile.name}` : ""),
      timestamp: new Date(),
      file: attachedFile ? { name: attachedFile.name, type: attachedFile.type } : undefined,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
    setAttachedFile(null)

    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "He recibido tu mensaje. Esta es una vista previa del diseño del chat. Aquí podrás subir archivos y hacer preguntas sobre ellos. La funcionalidad de análisis real se implementará en el backend.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, responseMessage])
    }, 500)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedFile(file)
    }
  }

  const handleResubir = () => {
    if (resubirFile) {
      const mockFile = new File([], resubirFile.name, { type: resubirFile.type })
      setAttachedFile(mockFile)
      setResubirFile(null)
    }
  }

  useEffect(() => {
    if (resubirFile) {
      handleResubir()
    }
  }, [resubirFile])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const closeWelcome = () => {
    setShowWelcome(false)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#030568] hover:bg-[#020446] shadow-lg shadow-blue-900/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-900/40 z-50 flex items-center justify-center"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl shadow-blue-900/20 border border-slate-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Header */}
      <div className="bg-[#030568] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#facc15] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[#030568]" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Asistente IA</h3>
            <p className="text-[#facc15] text-xs">En línea</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
            className={`h-8 w-8 hover:bg-white/10 text-white hover:text-white ${showHistory ? 'bg-white/20' : ''}`}
            title="Historial de archivos"
          >
            <History className="h-4 w-4" />
          </Button>
          <span className="text-white/80 text-xs font-medium mr-1">Historial</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 hover:bg-white/10 text-white hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Welcome Banner */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-[#facc15]/20 to-[#facc15]/10 px-4 py-2 flex items-center justify-between border-b border-[#facc15]/20">
          <p className="text-xs text-[#030568] font-medium">
            ¡Soy tu asistente virtual! ¿En qué puedo ayudarte?
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeWelcome}
            className="h-5 w-5 hover:bg-[#facc15]/20 text-[#030568]"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* File History Panel */}
      {showHistory && (
        <div className="bg-white border-b border-slate-200 max-h-[200px] overflow-y-auto">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#030568]">Archivos subidos</p>
            <span className="text-xs text-slate-400">{uploadedFiles.length} archivos</span>
          </div>
          <div className="p-2 space-y-1">
            {uploadedFiles.filter(f => eliminadoId !== f.id).map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 group border border-transparent hover:border-slate-200 transition-all ${confirmEliminar === file.id ? 'bg-red-50 border-red-200' : ''}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#030568] font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {file.date.toLocaleDateString()}
                    </p>
                    {resubirFile?.id === file.id && (
                      <p className="text-[10px] text-[#030568] font-medium mt-0.5 animate-pulse">
                        ✓ Listo para subir
                      </p>
                    )}
                  </div>
                </div>
                
                {confirmEliminar === file.id ? (
                  <div className="flex items-center gap-1 animate-in fade-in">
                    <span className="text-[10px] text-red-500 font-medium mr-1">¿Eliminar?</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setEliminadoId(file.id); setConfirmEliminar(null); }}
                      className="h-6 w-6 hover:bg-red-100 text-red-500"
                      title="Confirmar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmEliminar(null)}
                      className="h-6 w-6 hover:bg-slate-100 text-slate-500"
                      title="Cancelar"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setResubirFile({ id: file.id, name: file.name, type: file.type })}
                      className={`h-6 w-6 hover:bg-[#facc15]/20 ${resubirFile?.id === file.id ? 'text-[#030568] bg-[#facc15]/20' : 'text-slate-500 hover:text-[#030568]'}`}
                      title="Volver a subir"
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmEliminar(file.id)}
                      className="h-6 w-6 hover:bg-red-50 text-slate-500 hover:text-red-500"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 ${showHistory ? 'max-h-[220px]' : ''}`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === "assistant"
                  ? "bg-[#030568]"
                  : "bg-[#facc15]"
              }`}
            >
              {message.role === "assistant" ? (
                <Bot className="h-4 w-4 text-white" />
              ) : (
                <User className="h-4 w-4 text-[#030568]" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                message.role === "assistant"
                  ? "bg-white border border-slate-200 text-slate-800"
                  : "bg-[#030568] text-white"
              }`}
            >
              {message.file && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200/20">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs truncate max-w-[150px]">
                    {message.file.name}
                  </span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p
                className={`text-[10px] mt-1 ${
                  message.role === "assistant"
                    ? "text-slate-400"
                    : "text-white/60"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Attached File Preview */}
      {attachedFile && (
        <div className="px-4 py-2 bg-[#facc15]/10 border-t border-[#facc15]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#030568]" />
            <span className="text-xs text-[#030568] font-medium truncate max-w-[200px]">
              {attachedFile.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAttachedFile(null)}
            className="h-6 w-6 hover:bg-[#facc15]/20 text-[#030568]"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="min-h-[44px] max-h-[120px] resize-none border-slate-200 focus:border-[#030568] focus:ring-[#030568] text-sm rounded-xl"
              rows={1}
            />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 border-slate-200 hover:border-[#030568] hover:bg-[#030568]/5 text-slate-500 hover:text-[#030568] rounded-xl"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            className="h-11 w-11 bg-[#030568] hover:bg-[#020446] rounded-xl flex items-center justify-center"
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  )
}
