import Link from 'next/link'
import { Headset, TicketCheck, Brain, BarChart3, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: TicketCheck,
    title: 'Gestión de Tickets',
    desc: 'Crea, asigna y da seguimiento a tickets de soporte con un flujo de trabajo eficiente.',
  },
  {
    icon: Brain,
    title: 'Asistencia IA',
    desc: 'Clasificación automática, resumen, análisis de riesgo y sugerencias de respuesta inteligentes.',
  },
  {
    icon: BarChart3,
    title: 'Métricas y Reportes',
    desc: 'Dashboard con estadísticas en tiempo real y métricas de rendimiento del equipo.',
  },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <Headset className="h-4 w-4" />
            </div>
            <span>Soporte Técnico</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
          <div className="absolute right-0 top-0 -mr-48 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-48 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                Plataforma de soporte inteligente
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Soporte Técnico
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  con Asistencia IA
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                Gestión de tickets con asistencia de inteligencia artificial para priorización,
                resumen automático y sugerencias de respuesta inteligentes.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  Comenzar ahora
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-95"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Todo lo que necesitas para gestionar soporte
              </h2>
              <p className="mt-4 text-gray-600">
                Una plataforma completa con herramientas modernas para tu equipo de soporte.
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-md"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-gray-500 sm:px-6">
          &copy; {new Date().getFullYear()} Soporte Técnico. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}
