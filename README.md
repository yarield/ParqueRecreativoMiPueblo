# Parque Recreativo Mi Pueblo

Sistema de gestión para el Parque Recreativo Mi Pueblo. Permite administrar clientes, paquetes, categorías y facturación.

## Stack Tecnológico

### Frontend (SPA)

| Tecnología | Uso |
|---|---|
| **React 19** | Librería UI para construir la interfaz con componentes |
| **TypeScript** | Tipado estático en todo el proyecto |
| **Vite** | Bundler y servidor de desarrollo con HMR |
| **Tailwind CSS** | Framework de utilidades CSS para estilos |
| **shadcn/ui** | Componentes UI preconstruidos (tablas, modales, formularios) |
| **React Router DOM** | Navegación entre páginas sin recarga |
| **React Hook Form** | Manejo de formularios (valores, errores, envío) |
| **Zod** | Validación de esquemas para formularios |
| **TanStack Query** | Fetching, cache y sincronización de datos con el backend |

### Backend (API REST)

| Tecnología | Uso |
|---|---|
| **Node.js** | Entorno de ejecución del servidor |
| **Express** | Framework HTTP para definir endpoints |
| **Prisma** | ORM para acceso tipado a la base de datos |
| **TypeScript** | Tipado estático compartido con el frontend |

### Herramientas de desarrollo

| Tecnología | Uso |
|---|---|
| **Oxlint** | Linter rápido para calidad de código |
| **Git** | Control de versiones |

## Estructura del proyecto

```
Natacion/
├── backend/
│   ├── prisma/            # schema.prisma, migraciones y seed
│   └── src/
│       ├── config/        # validación de variables de entorno (Zod)
│       ├── lib/            # cliente Prisma, logger, contexto de auditoría
│       ├── middlewares/    # auth, validate, errorHandler, requestLogger
│       ├── routes/         # un archivo por recurso (clientes, paquetes, facturas...)
│       ├── schemas/        # validación Zod de requests
│       ├── services/       # lógica de negocio (ej. exportación a Excel)
│       └── tasks/          # tareas programadas (ej. actualizar estados)
└── frontend/
    └── src/
        ├── components/     # componentes por feature + ui/ (shadcn)
        ├── constants/       # strings y mensajes (nunca hardcodeados en componentes)
        ├── context/         # AuthContext
        ├── hooks/           # hooks de datos por feature (TanStack Query)
        ├── lib/             # helpers (api, fechas, descuentos, paginación)
        ├── pages/           # una página por ruta; delegan el JSX a components/
        ├── router/          # ProtectedRoute
        ├── schemas/         # validación Zod de formularios
        └── types/           # interfaces y tipos por feature
```

## Requisitos

- Node.js 24 (usado en desarrollo; ver `node --version`)
- PostgreSQL en ejecución (local o accesible por red)

## Puesta en marcha local

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # completar DATABASE_URL, JWT_SECRET, etc.
npx prisma migrate dev      # crea las tablas a partir de las migraciones
npm run seed                # crea el usuario administrador (ADMIN_* del .env)
npm run dev                 # levanta la API en http://localhost:3000

# 2. Frontend (en otra terminal)
cd frontend
npm install
npm run dev                 # levanta Vite en http://localhost:5173
```

En desarrollo, Vite hace proxy de `/api` hacia `http://localhost:3000` (ver `frontend/vite.config.ts`), así que el frontend no necesita configurar la URL del backend.

## Variables de entorno (backend)

Definidas y validadas en `backend/src/config/env.ts`. Ver `backend/.env.example` para la plantilla completa.

| Variable | Requerida | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión de PostgreSQL |
| `JWT_SECRET` | Sí | Clave para firmar tokens de sesión (mínimo 16 caracteres) |
| `PORT` | No (default `3000`) | Puerto del servidor |
| `CORS_ORIGIN` | No | Origen permitido en producción; si se omite, se aceptan todos |
| `NODE_ENV` | No (default `development`) | `development` \| `production` \| `test` |
| `LOG_LEVEL` | No (default `info`) | Nivel de log de Pino |
| `ADMIN_NOMBRE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Solo para `npm run seed` | Datos del primer administrador |

El frontend no requiere variables de entorno en desarrollo. `VITE_API_URL` es opcional (ver `frontend/src/config/api.config.ts`) y solo se usa si el backend no está detrás de la misma ruta relativa `/api`.

## Scripts disponibles

### Backend (`backend/`)

| Script | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor en desarrollo con `ts-node` |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Corre el build compilado (`dist/server.js`) |
| `npm run seed` | Crea el usuario administrador inicial |

### Frontend (`frontend/`)

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR (Vite) |
| `npm run build` | Type-check (`tsc -b`) y build de producción |
| `npm run lint` | Corre Oxlint |
| `npm run preview` | Sirve el build de producción localmente |

## Módulos / recursos de la API

Cada recurso vive en su propio archivo de rutas (`backend/src/routes/`):

- `auth` — login/registro y sesión
- `usuarios` — gestión de usuarios del sistema
- `clientes` — clientes del parque
- `categorias` — categorías de paquetes
- `paquetes` — paquetes (incluye precio abierto, por noche y comisión por canal)
- `facturas` — facturación, incluida exportación a Excel
- `estadisticas` — datos para el dashboard
- `auditoria` — registro de auditoría de acciones

## Despliegue

Ver [DEPLOY.md](./DEPLOY.md) para el procedimiento de despliegue en el servidor de producción.
