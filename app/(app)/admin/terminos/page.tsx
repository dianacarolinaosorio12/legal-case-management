"use client"

import { useState, useMemo } from "react"
import {
  Settings,
  Plus,
  Pencil,
  Clock,
  Calendar,
  Search,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  mockTerminosProcesales,
  type TerminoProcesal,
  type CaseArea,
} from "@/tests/mocks/mock-data"

const ALL_AREAS: CaseArea[] = [
  "Penal",
  "Civil",
  "Laboral",
  "Familia",
  "Derecho Publico",
  "Derecho Disciplinario",
  "Responsabilidad Fiscal",
  "Constitucional",
  "Comercial",
  "Sucesiones",
  "Conciliacion",
  "Transito",
  "Otros",
]

export default function TerminosProcesalesPage() {
  // Local state seeded from mock data
  const [terminos, setTerminos] = useState<TerminoProcesal[]>(
    () => [...mockTerminosProcesales]
  )

  // Filters
  const [filterArea, setFilterArea] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Add dialog
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newName, setNewName] = useState("")
  const [newArea, setNewArea] = useState<CaseArea>("Civil")
  const [newDays, setNewDays] = useState("")
  const [newDescription, setNewDescription] = useState("")

  // Edit dialog
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTermino, setEditingTermino] = useState<TerminoProcesal | null>(
    null
  )
  const [editDays, setEditDays] = useState("")
  const [editName, setEditName] = useState("")
  const [editArea, setEditArea] = useState<CaseArea>("Civil")
  const [editDescription, setEditDescription] = useState("")

  // Derived stats
  const totalTerminos = terminos.length
  const activeTerminos = terminos.filter((t) => t.isActive).length
  const areasCovered = new Set(terminos.filter((t) => t.isActive).map((t) => t.area)).size

  // Filtered list
  const filteredTerminos = useMemo(() => {
    return terminos.filter((t) => {
      const q = searchQuery.toLowerCase()
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      const matchArea = filterArea === "all" || t.area === filterArea
      return matchSearch && matchArea
    })
  }, [terminos, searchQuery, filterArea])

  // Unique areas present in the data
  const uniqueAreas = [...new Set(terminos.map((t) => t.area))]

  // Toggle active/inactive
  function handleToggleActive(id: string) {
    setTerminos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    )
  }

  // Open edit dialog
  function handleOpenEdit(termino: TerminoProcesal) {
    setEditingTermino(termino)
    setEditDays(String(termino.defaultDays))
    setEditName(termino.name)
    setEditArea(termino.area)
    setEditDescription(termino.description)
    setShowEditDialog(true)
  }

  // Save edit
  function handleSaveEdit() {
    if (!editingTermino) return
    const days = parseInt(editDays, 10)
    if (isNaN(days) || days < 1) return
    setTerminos((prev) =>
      prev.map((t) =>
        t.id === editingTermino.id
          ? {
              ...t,
              name: editName.trim() || t.name,
              area: editArea,
              defaultDays: days,
              description: editDescription.trim() || t.description,
            }
          : t
      )
    )
    setShowEditDialog(false)
    setEditingTermino(null)
  }

  // Add new termino
  function handleAddTermino() {
    const days = parseInt(newDays, 10)
    if (!newName.trim() || isNaN(days) || days < 1) return
    const newTermino: TerminoProcesal = {
      id: `tp${Date.now()}`,
      name: newName.trim(),
      defaultDays: days,
      area: newArea,
      description: newDescription.trim(),
      isActive: true,
    }
    setTerminos((prev) => [...prev, newTermino])
    setShowAddDialog(false)
    resetAddForm()
  }

  function resetAddForm() {
    setNewName("")
    setNewArea("Civil")
    setNewDays("")
    setNewDescription("")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">
            Configuracion de Terminos Procesales
          </h1>
          <p className="text-sm text-muted-foreground">
            Administre los plazos legales predeterminados que se aplican a cada
            tipo de actuacion procesal.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="w-fit bg-primary/10 text-primary"
        >
          <Settings size={12} className="mr-1" />
          Configuracion del sistema
        </Badge>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <Info
          size={20}
          className="mt-0.5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            Impacto en calendarios y semaforos
          </p>
          <p className="text-xs text-muted-foreground">
            Los calendarios de todos los roles se renderizan basandose en esta
            configuracion de terminos. Cualquier cambio en los dias
            predeterminados se reflejara en los plazos y semaforos de los
            expedientes futuros.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border shadow-card card-hover">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings size={18} className="text-primary" aria-hidden="true" />
            </div>
            <div>
              <span className="text-3xl font-bold text-foreground">
                {totalTerminos}
              </span>
              <p className="text-sm text-muted-foreground">Total terminos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card card-hover">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Clock size={18} className="text-success" aria-hidden="true" />
            </div>
            <div>
              <span className="text-3xl font-bold text-foreground">
                {activeTerminos}
              </span>
              <p className="text-sm text-muted-foreground">Terminos activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card card-hover">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <Calendar
                size={18}
                className="text-secondary"
                aria-hidden="true"
              />
            </div>
            <div>
              <span className="text-3xl font-bold text-foreground">
                {areasCovered}
              </span>
              <p className="text-sm text-muted-foreground">Areas cubiertas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Add Button */}
      <Card className="border-border shadow-card">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Buscar por nombre o descripcion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9"
              aria-label="Buscar terminos procesales"
            />
          </div>
          <Select value={filterArea} onValueChange={setFilterArea}>
            <SelectTrigger className="w-full sm:w-52 h-10">
              <SelectValue placeholder="Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las areas</SelectItem>
              {uniqueAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground self-center">
            {filteredTerminos.length} termino(s)
          </span>
          <Button
            className="flex items-center gap-2 ml-auto"
            onClick={() => {
              resetAddForm()
              setShowAddDialog(true)
            }}
          >
            <Plus size={16} aria-hidden="true" />
            Agregar termino
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Clock size={18} aria-hidden="true" />
            Terminos Procesales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Area</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Descripcion
                  </TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="w-20">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTerminos.map((termino) => (
                  <TableRow
                    key={termino.id}
                    className={!termino.isActive ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {termino.name}
                        </span>
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {termino.area}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary text-xs"
                      >
                        {termino.area}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Clock
                          size={14}
                          className="text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-bold text-foreground">
                          {termino.defaultDays}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          dias
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {termino.description}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={termino.isActive}
                        onCheckedChange={() => handleToggleActive(termino.id)}
                        aria-label={`${termino.isActive ? "Desactivar" : "Activar"} ${termino.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-transparent"
                        onClick={() => handleOpenEdit(termino)}
                      >
                        <Pencil size={12} className="mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTerminos.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No se encontraron terminos procesales con estos filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Termino Procesal</DialogTitle>
            <DialogDescription>
              Defina un nuevo termino procesal con sus dias predeterminados. Se
              creara como activo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="addName">Nombre del termino</Label>
              <Input
                id="addName"
                placeholder="Ej: Recurso de reposicion"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="addArea">Area juridica</Label>
              <Select
                value={newArea}
                onValueChange={(v) => setNewArea(v as CaseArea)}
              >
                <SelectTrigger id="addArea">
                  <SelectValue placeholder="Seleccionar area" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_AREAS.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="addDays">Dias predeterminados</Label>
              <Input
                id="addDays"
                type="number"
                min={1}
                placeholder="Ej: 10"
                value={newDays}
                onChange={(e) => setNewDays(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="addDesc">Descripcion</Label>
              <Input
                id="addDesc"
                placeholder="Descripcion breve del termino"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddTermino}
              disabled={
                !newName.trim() || !newDays || parseInt(newDays, 10) < 1
              }
            >
              <Plus size={14} className="mr-1" />
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Termino Procesal</DialogTitle>
            <DialogDescription>
              Modifique los campos del termino. Los cambios se aplicaran a los
              expedientes futuros.
            </DialogDescription>
          </DialogHeader>
          {editingTermino && (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="editName">Nombre</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="editArea">Area juridica</Label>
                <Select
                  value={editArea}
                  onValueChange={(v) => setEditArea(v as CaseArea)}
                >
                  <SelectTrigger id="editArea">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_AREAS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="editDays">Dias predeterminados</Label>
                <Input
                  id="editDays"
                  type="number"
                  min={1}
                  value={editDays}
                  onChange={(e) => setEditDays(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="editDesc">Descripcion</Label>
                <Input
                  id="editDesc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                <Calendar
                  size={16}
                  className="mt-0.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p className="text-xs text-foreground">
                  Los expedientes existentes conservaran sus plazos actuales.
                  Solo los nuevos expedientes usaran el plazo actualizado.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editDays || parseInt(editDays, 10) < 1}
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
