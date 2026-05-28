'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { Ticket } from '@/types'

export default function DashboardPage() {
  const { user, isLoading, logout, token } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!token) return
    api.get<Ticket[]>('/tickets', token!)
      .then(setTickets)
      .catch(() => {})
  }, [token])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  const openCount = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length
  const highPriorityCount = tickets.filter(
    (t) => t.priority === 'high' || t.priority === 'critical',
  ).length
  const totalCount = tickets.length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold">Panel de Soporte</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/tickets"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Ver tickets
            </Link>
            <Link
              href="/tickets/new"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Nuevo Ticket
            </Link>
            {user.role === 'admin' && (
              <>
                <Link href="/admin/users" className="text-sm text-gray-600 hover:text-gray-900">
                  Usuarios
                </Link>
                <Link href="/admin/metrics" className="text-sm text-gray-600 hover:text-gray-900">
                  Métricas
                </Link>
              </>
            )}
            <span className="text-sm text-gray-600">
              {user.name} <span className="text-xs text-gray-400">({user.role})</span>
            </span>
            <button
              onClick={logout}
              className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Tickets</p>
            <p className="mt-1 text-3xl font-bold">{totalCount}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Abiertos</p>
            <p className="mt-1 text-3xl font-bold text-yellow-600">{openCount}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">En Progreso</p>
            <p className="mt-1 text-3xl font-bold text-blue-600">{inProgressCount}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Resueltos</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{resolvedCount}</p>
          </div>
        </div>

        {highPriorityCount > 0 && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              {highPriorityCount} ticket{highPriorityCount > 1 ? 's' : ''} con prioridad alta o crítica requieren atención
            </p>
          </div>
        )}

        {tickets.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Tickets Recientes</h2>
            <div className="space-y-2">
              {tickets.slice(0, 5).map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="block rounded-lg bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {ticket.title}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status === 'open' ? 'Abierto' :
                       ticket.status === 'in_progress' ? 'En Progreso' : 'Resuelto'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(ticket.created_at).toLocaleDateString('es-MX')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
