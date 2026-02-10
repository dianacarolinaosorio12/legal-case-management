# SICOP - Sistema Integral de Consultorio de Orientacion y Practica

Sistema de gestion de casos legales para el consultorio juridico de la **Universitaria de Colombia**.

---

## Requisitos Previos

| Herramienta | Version minima |
|-------------|---------------|
| **Node.js** | v18 o superior (recomendado v24) |
| **npm** | v9 o superior |

> Verifica tus versiones con:
> ```bash
> node -v
> npm -v
> ```

---

## Instalacion

1. **Clona o descarga** el proyecto y abre una terminal en la carpeta raiz:

   ```bash
   cd legal-case-management
   ```

2. **Instala las dependencias** (usa `--legacy-peer-deps` por compatibilidad con React 19):

   ```bash
   npm install --legacy-peer-deps
   ```

---

## Ejecucion

### Modo Desarrollo (con recarga en vivo)

```bash
npm run dev
```

Abre en tu navegador: **http://localhost:3000**

### Modo Produccion

```bash
npm run build
npm run start
```

Abre en tu navegador: **http://localhost:3000**

---

## Acceso al Sistema

El proyecto usa datos de prueba (mock data) y un selector de roles en la pantalla de login.

### Roles disponibles

| Rol | Ruta principal | Descripcion |
|-----|---------------|-------------|
| **Estudiante** | `/dashboard` | Gestion de casos asignados, crear nuevos casos, calendario, estados |
| **Profesor** | `/profesor` | Bandeja de entrada, revision de casos, estados |
| **Administrativo** | `/admin` | Panel general, CRUD usuarios, practicas, reportes, estados |

### Como ingresar

1. Ve a **http://localhost:3000** (redirige al login automaticamente)
2. Selecciona un **rol** (Estudiante, Profesor o Administrativo)
3. El sistema te redirige al panel correspondiente

### Usuarios de prueba

| Nombre | Rol | Area |
|--------|-----|------|
| Maria Fernanda Lopez | Estudiante | Derecho de Familia |
| Carlos Andres Ramirez | Estudiante | Derecho Penal |
| Ana Maria Torres | Estudiante | Derecho Laboral |
| Dr. Roberto Mendoza | Profesor | Derecho de Familia |
| Dra. Patricia Vargas | Profesor | Derecho Penal |
| Admin Sistema | Administrativo | Todas |

---

## Estructura de Paginas

### Estudiante (`/dashboard`)

| Pagina | Ruta | Descripcion |
|--------|------|-------------|
| Mis Casos | `/dashboard` | Lista de casos asignados al estudiante |
| Nuevo Caso | `/dashboard/nuevo-caso` | Formulario paso a paso para crear expedientes (incluye horas estimadas) |
| Detalle de Caso | `/dashboard/casos/[id]` | Timeline, documentos y estado del caso |
| Calendario | `/dashboard/calendario` | Vista mensual de audiencias y vencimientos |
| Estado de Casos | `/dashboard/estados` | Dashboard con estados, horas y filtros |

### Profesor (`/profesor`)

| Pagina | Ruta | Descripcion |
|--------|------|-------------|
| Bandeja de Entrada | `/profesor` | Casos pendientes de revision filtrados por area |
| Revisar Caso | `/profesor/revisar/[id]` | Flujo de revision con aprobacion/devolucion |
| Estado de Casos | `/profesor/estados` | Dashboard compartido de estados |

### Administrativo (`/admin`)

| Pagina | Ruta | Descripcion |
|--------|------|-------------|
| Panel General | `/admin` | Estadisticas, graficas y resumen del consultorio |
| Estado de Casos | `/admin/estados` | Dashboard de estados con filtros y conteo de horas |
| Usuarios | `/admin/usuarios` | CRUD completo de usuarios del sistema |
| Practicas | `/admin/practicas` | Control de horas de practica por estudiante (meta: 120h) |
| Reportes | `/admin/reportes` | Generacion de reportes con descarga en PDF y Excel |
| Auditoria | `/admin/auditoria` | Registro de actividades del sistema |
| Configuracion | `/admin/configuracion` | Parametros generales del consultorio |

---

## Stack Tecnologico

| Tecnologia | Version | Uso |
|------------|---------|-----|
| [Next.js](https://nextjs.org/) | 16.1.6 | Framework React con App Router |
| [React](https://react.dev/) | 19 | Libreria de UI |
| [TypeScript](https://www.typescriptlang.org/) | 5.7.3 | Tipado estatico |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.17 | Estilos utilitarios |
| [shadcn/ui](https://ui.shadcn.com/) | - | Componentes UI (Radix UI) |
| [Recharts](https://recharts.org/) | 2.15.0 | Graficas y estadisticas |
| [Lucide React](https://lucide.dev/) | 0.544.0 | Iconografia |
| [date-fns](https://date-fns.org/) | 4.1.0 | Manejo de fechas |

---

## Scripts Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con recarga en vivo |
| `npm run build` | Compila el proyecto para produccion |
| `npm run start` | Inicia el servidor de produccion (ejecutar `build` primero) |
| `npm run lint` | Ejecuta ESLint para verificar calidad del codigo |

---

## Estructura del Proyecto

```
legal-case-management/
├── app/
│   ├── (app)/                  # Rutas protegidas (requieren autenticacion)
│   │   ├── admin/              # Panel administrativo
│   │   │   ├── estados/        # Dashboard de estados
│   │   │   ├── usuarios/       # CRUD de usuarios
│   │   │   ├── practicas/      # Horas de practica
│   │   │   └── reportes/       # Reportes PDF/Excel
│   │   ├── dashboard/          # Panel de estudiante
│   │   │   ├── nuevo-caso/     # Formulario nuevo expediente
│   │   │   ├── casos/[id]/     # Detalle de caso
│   │   │   ├── calendario/     # Calendario de eventos
│   │   │   └── estados/        # Dashboard de estados
│   │   └── profesor/           # Panel de profesor
│   │       ├── revisar/[id]/   # Revision de caso
│   │       └── estados/        # Dashboard de estados
│   ├── (auth)/login/           # Pagina de login
│   ├── globals.css             # Estilos globales y tema
│   └── layout.tsx              # Layout raiz
├── components/                 # Componentes reutilizables
│   ├── ui/                     # Componentes shadcn/ui
│   ├── app-sidebar.tsx         # Sidebar estudiante
│   ├── admin-sidebar.tsx       # Sidebar administrador
│   ├── professor-sidebar.tsx   # Sidebar profesor
│   └── app-header.tsx          # Header compartido
├── lib/
│   ├── mock-data.ts            # Datos de prueba y tipos
│   ├── auth-context.tsx        # Contexto de autenticacion
│   └── utils.ts                # Utilidades (cn, etc.)
├── hooks/                      # Custom hooks
├── public/                     # Archivos estaticos
├── tailwind.config.ts          # Configuracion Tailwind
├── tsconfig.json               # Configuracion TypeScript
└── next.config.mjs             # Configuracion Next.js
```

---

## Solucion de Problemas

### El puerto 3000 esta ocupado

Si al ejecutar `npm run dev` ves un error de puerto ocupado:

**Windows (CMD):**
```bash
netstat -ano | findstr :3000
taskkill /PID <numero_pid> /F
```

**Windows (PowerShell):**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

Luego vuelve a ejecutar `npm run dev`.

### Error de dependencias al instalar

Siempre usa la flag `--legacy-peer-deps`:

```bash
npm install --legacy-peer-deps
```

Esto es necesario porque React 19 tiene conflictos de peer dependencies con algunos paquetes.

### La carpeta .next da problemas

Elimina la carpeta `.next` y vuelve a compilar:

```bash
rm -rf .next
npm run dev
```

---

## Marca Institucional

El sistema usa los colores oficiales de la **Universitaria de Colombia**:

| Color | Hex | Uso |
|-------|-----|-----|
| Navy Profundo | `#030568` | Sidebar, encabezados |
| Dorado | `#facc15` | Acentos, botones destacados |
| Blanco | `#ffffff` | Fondo principal, textos sobre navy |

---

## Notas Importantes

- Este proyecto usa **datos de prueba** (mock data). No tiene conexion a base de datos.
- La autenticacion es simulada con `sessionStorage` (se pierde al cerrar el navegador).
- El diseño es **totalmente responsive** y funciona en dispositivos moviles, tablets y escritorio.
- Los reportes de PDF y Excel generan archivos de ejemplo (funcionalidad simulada).
