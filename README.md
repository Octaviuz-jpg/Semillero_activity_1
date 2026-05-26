# Plataforma de Soporte Técnico

Plataforma de soporte técnico con autenticación, gestión de tickets y asistencia de IA para priorización, resumen y sugerencias de respuesta.

## Stack

- **Frontend:** Next.js 16 + Tailwind CSS 4
- **Backend:** Node.js / Express + TypeScript
- **Base de datos:** PostgreSQL (Supabase)
- **IA:** Groq API (Llama 3 70B)
- **Automatización:** n8n
- **Deploy:** Frontend en Vercel, Backend en Railway/Render/Fly.io, DB en Supabase

## Estructura

```
semillero-actividad-1/
├── frontend/            # Next.js app (App Router)
│   └── src/
│       ├── app/         # Páginas (login, register, dashboard, tickets, admin)
│       ├── components/  # Componentes UI (Badge, AIPanel)
│       ├── lib/         # Utilidades (api client, auth context)
│       └── types/       # Interfaces TypeScript
├── backend/             # Express API
│   └── src/
│       ├── routes/      # auth, tickets, comments, categories, ai, admin, webhooks
│       ├── services/    # Lógica de negocio (auth, tickets, comments, categories, ai)
│       ├── middleware/   # auth (JWT), roles
│       ├── lib/         # Supabase client, Groq client, schema.sql
│       └── types/       # Interfaces compartidas
├── n8n-workflows/       # Workflows exportables (email, Slack, daily summary)
└── docs/                # Documentación adicional
```

## Setup local

### Prerrequisitos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com) (free tier)
- API Key de [Groq](https://console.groq.com) (free tier)
- npm

### Backend

```bash
cd backend
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=4000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=tu_clave_secreta_aleatoria
GROQ_API_KEY=tu_groq_api_key
FRONTEND_URL=http://localhost:3000
```

Ejecutar el schema SQL (`src/lib/schema.sql`) en el SQL Editor de Supabase.

Instalar y correr:

```bash
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
```

Editar `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Instalar y correr:

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Endpoints de la API

### Autenticación
- `POST /api/auth/register` — Registrar usuario
- `POST /api/auth/login` — Iniciar sesión

### Tickets
- `GET /api/tickets` — Listar tickets (filtros: status, priority, user_id, assigned_to)
- `POST /api/tickets` — Crear ticket
- `GET /api/tickets/:id` — Obtener ticket
- `PATCH /api/tickets/:id` — Actualizar ticket
- `DELETE /api/tickets/:id` — Eliminar ticket (admin)

### Comentarios
- `GET /api/tickets/:ticketId/comments` — Listar comentarios
- `POST /api/tickets/:ticketId/comments` — Crear comentario

### Categorías
- `GET /api/categories` — Listar categorías
- `POST /api/categories` — Crear categoría (admin)
- `PATCH /api/categories/:id` — Actualizar categoría (admin)

### IA (Groq)
- `POST /api/ai/classify` — Clasificar prioridad y sentimiento
- `POST /api/ai/summarize` — Resumir ticket
- `POST /api/ai/suggest-reply` — Sugerir respuesta
- `POST /api/ai/risk-analysis` — Analizar riesgo
- `POST /api/ai/next-action` — Recomendar acción
- `POST /api/ai/approve` — Aprobar acción (human-in-the-loop)

### Admin
- `GET /api/admin/users` — Listar usuarios (admin)
- `PATCH /api/admin/users/:id/role` — Cambiar rol (admin)
- `GET /api/admin/metrics` — Métricas del sistema (admin)

### Webhooks (n8n)
- `POST /api/webhooks/ticket-created` — Email al crear ticket
- `POST /api/webhooks/high-priority-alert` — Alerta Slack alta prioridad
- `GET /api/webhooks/daily-summary` — Resumen diario

## Roles

| Rol | Permisos |
|---|---|
| `user` | Crear tickets, ver sus tickets, comentar |
| `agent` | Todo lo de user + cambiar estado, ver todos los tickets, panel IA |
| `admin` | Todo lo de agent + CRUD categorías, gestión de usuarios, métricas |

## Automatización n8n

Los workflows en `n8n-workflows/` se importan directamente en n8n:

1. **ticket-created-email.json** — Envía email al usuario cuando crea un ticket
2. **high-priority-slack.json** — Alerta a Slack cuando hay prioridad alta/crítica
3. **daily-summary.json** — Resumen diario de tickets al manager

Configurar en n8n: Webhook URL → `http://localhost:4000/api/webhooks/`

## Deploy

### Frontend (Vercel)

```bash
cd frontend
npx vercel --prod
```

Variables de entorno en Vercel:
- `NEXT_PUBLIC_API_URL` → `https://tu-api.com/api`

### Backend (Railway / Render / Fly.io)

```bash
cd backend
# Seguir instrucciones del proveedor
```

### Base de datos (Supabase)

- Crear proyecto en Supabase
- Ejecutar `backend/src/lib/schema.sql` en SQL Editor
- Copiar URL y Service Key al `.env` del backend

## Licencia

MIT
