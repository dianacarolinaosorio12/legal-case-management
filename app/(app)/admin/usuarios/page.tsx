"use client"

import { useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  BookText,
  Settings,
  Search,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
  mockUsers,
  type SystemUser,
  type UserRole,
  type CaseArea,
} from "@/lib/mock-data"

// Extended user type for this page (adds fields not in base SystemUser)
interface ExtendedUser extends SystemUser {
  semestre?: number
  horasPractica?: number
}

// Initialize extended users from mock data
const initialUsers: ExtendedUser[] = mockUsers.map((u) => ({
  ...u,
  semestre: u.role === "estudiante" ? Math.floor(Math.random() * 4) + 7 : undefined,
  horasPractica: u.role === "estudiante" ? Math.floor(Math.random() * 200) + 50 : undefined,
}))

const AREAS: CaseArea[] = ["Penal", "Civil", "Laboral", "Familia", "Derecho Publico"]
const ROLES: { value: UserRole; label: string }[] = [
  { value: "estudiante", label: "Estudiante" },
  { value: "profesor", label: "Profesor" },
  { value: "administrativo", label: "Administrativo" },
]

const roleBadgeClass: Record<UserRole, string> = {
  estudiante: "bg-secondary/10 text-secondary",
  profesor: "bg-primary/10 text-primary",
  administrativo: "bg-accent/20 text-accent-foreground",
}

const emptyForm = {
  name: "",
  email: "",
  role: "" as UserRole | "",
  area: "" as CaseArea | "",
  semestre: "",
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<ExtendedUser[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("todos")

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Form state
  const [formData, setFormData] = useState(emptyForm)
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)

  // Stats
  const totalUsers = users.length
  const totalEstudiantes = users.filter((u) => u.role === "estudiante").length
  const totalProfesores = users.filter((u) => u.role === "profesor").length
  const totalAdministrativos = users.filter((u) => u.role === "administrativo").length

  const stats = [
    {
      title: "Total Usuarios",
      value: totalUsers,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Estudiantes",
      value: totalEstudiantes,
      icon: GraduationCap,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Profesores",
      value: totalProfesores,
      icon: BookText,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Administrativos",
      value: totalAdministrativos,
      icon: Settings,
      color: "text-accent-foreground",
      bg: "bg-accent/20",
    },
  ]

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "todos" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Handlers
  function handleOpenCreate() {
    setFormData(emptyForm)
    setShowCreateDialog(true)
  }

  function handleCreate() {
    if (!formData.name || !formData.email || !formData.role) return

    const newUser: ExtendedUser = {
      id: `u${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role as UserRole,
      area: formData.role !== "administrativo" && formData.area ? (formData.area as CaseArea) : undefined,
      activeCases: 0,
      semestre: formData.role === "estudiante" && formData.semestre ? Number(formData.semestre) : undefined,
      horasPractica: formData.role === "estudiante" ? 0 : undefined,
    }

    setUsers((prev) => [...prev, newUser])
    setShowCreateDialog(false)
    setFormData(emptyForm)
  }

  function handleOpenEdit(user: ExtendedUser) {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      area: user.area || "",
      semestre: user.semestre ? String(user.semestre) : "",
    })
    setShowEditDialog(true)
  }

  function handleEdit() {
    if (!selectedUser || !formData.name || !formData.email || !formData.role) return

    setUsers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? {
              ...u,
              name: formData.name,
              email: formData.email,
              role: formData.role as UserRole,
              area:
                (formData.role as UserRole) !== "administrativo" && formData.area
                  ? (formData.area as CaseArea)
                  : undefined,
              semestre:
                (formData.role as UserRole) === "estudiante" && formData.semestre
                  ? Number(formData.semestre)
                  : undefined,
              horasPractica:
                (formData.role as UserRole) === "estudiante" ? u.horasPractica : undefined,
            }
          : u
      )
    )
    setShowEditDialog(false)
    setSelectedUser(null)
    setFormData(emptyForm)
  }

  function handleOpenDelete(user: ExtendedUser) {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  function handleDelete() {
    if (!selectedUser) return
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
    setShowDeleteDialog(false)
    setSelectedUser(null)
  }

  // Shared form fields used in both Create and Edit dialogs
  function renderFormFields() {
    const showAreaField = formData.role === "estudiante" || formData.role === "profesor"

    return (
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="userName">Nombre completo</Label>
          <Input
            id="userName"
            placeholder="Ej: Maria Gonzalez"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="userEmail">Correo electronico</Label>
          <Input
            id="userEmail"
            type="email"
            placeholder="Ej: mgonzalez@universidad.edu.co"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="userRole">Rol</Label>
          <Select
            value={formData.role}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                role: value as UserRole,
                area: value === "administrativo" ? "" : prev.area,
                semestre: value !== "estudiante" ? "" : prev.semestre,
              }))
            }
          >
            <SelectTrigger id="userRole">
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showAreaField && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="userArea">Area juridica</Label>
            <Select
              value={formData.area}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, area: value as CaseArea }))
              }
            >
              <SelectTrigger id="userArea">
                <SelectValue placeholder="Seleccionar area" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.role === "estudiante" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="userSemestre">Semestre</Label>
            <Input
              id="userSemestre"
              type="number"
              min={1}
              max={12}
              placeholder="Ej: 8"
              value={formData.semestre}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, semestre: e.target.value }))
              }
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground heading-accent pb-2">
          Gestion de Usuarios
        </h1>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2 w-fit">
          <Plus size={16} aria-hidden="true" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border shadow-card card-hover">
            <CardContent className="flex flex-col gap-3 p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} aria-hidden="true" />
              </div>
              <div>
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="border-border shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="hidden md:table-cell">Area</TableHead>
                  <TableHead className="text-center">Casos activos</TableHead>
                  <TableHead className="hidden lg:table-cell text-center">
                    Horas practica
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-xs text-muted-foreground sm:hidden">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={roleBadgeClass[user.role]}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {user.area || "N/A"}
                      </TableCell>
                      <TableCell className="text-center text-foreground">
                        {user.activeCases}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center text-muted-foreground">
                        {user.horasPractica !== undefined ? `${user.horasPractica}h` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenEdit(user)}
                            aria-label={`Editar ${user.name}`}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleOpenDelete(user)}
                            aria-label={`Eliminar ${user.name}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Mostrando {filteredUsers.length} de {users.length} usuarios
      </p>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete los datos del nuevo usuario del sistema.
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name || !formData.email || !formData.role}
            >
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifique los datos de{" "}
              <span className="font-semibold">{selectedUser?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.name || !formData.email || !formData.role}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminacion</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente al usuario{" "}
              <span className="font-semibold text-foreground">{selectedUser?.name}</span> del
              sistema.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex flex-col gap-1 text-sm">
                <p>
                  <span className="font-medium">Nombre:</span> {selectedUser.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {selectedUser.email}
                </p>
                <p>
                  <span className="font-medium">Rol:</span>{" "}
                  {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                </p>
                {selectedUser.activeCases > 0 && (
                  <p className="mt-1 text-xs text-destructive font-medium">
                    Este usuario tiene {selectedUser.activeCases} caso(s) activo(s). Debera
                    reasignarlos antes de proceder.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 size={14} className="mr-2" />
              Eliminar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
