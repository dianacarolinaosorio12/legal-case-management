# SICOP Backend - Microservices Architecture

## Arquitectura

Este backend ha sido reestructurado en microservicios independientes:

- **auth-service** (puerto 3001): Gestión de autenticación y usuarios
- **student-service** (puerto 3002): Gestión de casos legales de estudiantes

## Estructura de Carpetas

```
/back
├── auth-service/
│   ├── src/
│   │   ├── index.ts
│   │   └── routes/
│   │       └── auth.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env
├── student-service/
│   ├── src/
│   │   ├── index.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── routes/
│   │       └── cases.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env
└── docker-compose.yml
```

## Inicialización Rápida

### 1. Levantar los servicios con Docker

```bash
cd back
docker-compose up -d
```

Esto iniciará:
- 2 bases de datos PostgreSQL (puertos 5432 y 5433)
- auth-service en http://localhost:3001
- student-service en http://localhost:3002

### 2. Configurar las bases de datos

```bash
# Para auth-service
cd auth-service
npm install
npm run db:migrate
npm run db:generate

# Para student-service
cd ../student-service
npm install
npm run db:migrate
npm run db:generate
```

### 3. Poblar datos iniciales (opcional)

Puedes usar Prisma Studio para visualizar y añadir datos:

```bash
# En auth-service
npm run db:studio

# En student-service  
npm run db:studio
```

## Endpoints

### Auth Service (http://localhost:3001)

- `POST /auth/login` - Autenticación de usuarios
- `GET /health` - Health check

**Request POST /auth/login:**
```json
{
  "email": "mgonzalez@universidad.edu.co",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Maria Gonzalez",
    "email": "mgonzalez@universidad.edu.co",
    "role": "estudiante",
    "area": "Laboral",
    "activeCases": 6,
    "totalPracticeHours": 98,
    "semester": "8vo Semestre"
  }
}
```

### Student Service (http://localhost:3002)

- `GET /cases` - Obtener casos del estudiante (requiere JWT)
- `GET /health` - Health check

**Request GET /cases:**
```bash
Headers:
Authorization: Bearer <jwt_token>
```

## Integración con Frontend

### Configuración de Variables de Entorno

En el frontend (Next.js), actualiza tu archivo `.env.local`:

```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_STUDENT_SERVICE_URL=http://localhost:3002
```

### Actualización del Contexto de Autenticación

El `auth-context.tsx` ha sido actualizado para:
1. Realizar peticiones HTTP al auth-service
2. Manejar tokens JWT en sessionStorage
3. Mantener compatibilidad con la UI existente

## Flujo de Autenticación

1. **Login**: Frontend → auth-service → Database → JWT Token
2. **Petición Protegida**: Frontend + JWT → student-service → Validación JWT → Database
3. **Logout**: Frontend elimina token de sessionStorage

## Usuarios por Defecto

Para desarrollo, puedes usar estos usuarios:

- **Estudiante**: mgonzalez@universidad.edu.co / password123
- **Profesor**: jperez@universidad.edu.co / password123  
- **Administrativo**: sdiaz@universidad.edu.co / password123

## Desarrollo Local

### Sin Docker

Si prefieres ejecutar los servicios localmente:

```bash
# Terminal 1 - Auth Service
cd back/auth-service
npm install
npm run db:generate
npm run dev

# Terminal 2 - Student Service  
cd back/student-service
npm install
npm run db:generate
npm run dev

# Terminal 3 - Base de datos Auth
docker run --name auth-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=auth_db -p 5432:5432 -d postgres:15

# Terminal 4 - Base de datos Student
docker run --name student-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=student_db -p 5433:5432 -d postgres:15
```

## Consideraciones de Seguridad

- **JWT Secret**: Cambia el JWT_SECRET en producción
- **Contraseñas**: Hashear con bcryptjs antes de almacenar
- **CORS**: Configurado para localhost:3000, ajustar para producción
- **Environment Variables**: No exponer variables sensibles en el cliente

## Monitoreo y Logs

- Los errores se loguean en consola
- Health checks en `/health` para cada servicio
- Prisma Studio para visualización de datos

## Próximos Pasos

1. Implementar refresh tokens
2. Añadir rate limiting
3. Configurar HTTPS
4. Implementar logging estructurado
5. Añadir tests unitarios y de integración