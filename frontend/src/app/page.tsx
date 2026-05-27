import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Plataforma de Soporte Técnico
        </h1>
        <p className="text-lg text-gray-600">
          Gestión de tickets con asistencia de IA para priorización, resumen y sugerencias de respuesta.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  )
}
