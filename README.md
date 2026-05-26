# Plataforma de Soporte Técnico

Plataforma de soporte técnico con autenticación, gestión de tickets y asistencia de IA para priorización, resumen y sugerencias de respuesta.

## Stack

- **Frontend:** Next.js + Tailwind CSS
- **Backend:** Node.js / Express + TypeScript
- **Base de datos:** PostgreSQL (Supabase)
- **IA:** Groq API (Llama 3)
- **Automatización:** n8n
- **Deploy:** Vercel + Supabase

## Estructura

```
semillero-actividad-1/
├── frontend/    # Next.js app
├── backend/     # Express API
├── n8n-workflows/
└── docs/
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Licencia

MIT
