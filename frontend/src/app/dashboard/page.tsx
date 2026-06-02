'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import type { Ticket } from '@/types'
import { Ticket as TicketIcon, Circle, Clock, CheckCircle2, AlertTriangle, ArrowRight, Plus, FileText } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading, token } = useAuth()
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
      .catch((err) => console.error('Error fetching tickets:', err))
  }, [token])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <span className="text-sm">Cargando...</span>
        </div>
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

  const stats = [
    {
      label: 'Total Tickets',
      value: totalCount,
      icon: TicketIcon,
      gradient: 'from-gray-600 to-gray-700',
      bg: 'bg-gray-50',
      textColor: 'text-gray-700',
    },
    {
      label: 'Abiertos',
      value: openCount,
      icon: Circle,
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: 'En Progreso',
      value: inProgressCount,
      icon: Clock,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Resueltos',
      value: resolvedCount,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Soporte</h1>
            <p className="mt-1 text-sm text-gray-500">
              Bienvenido, {user.name}
            </p>
          </div>
          <Link
            href="/tickets/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Nuevo Ticket
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="animate-slide-up group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className={`mt-1 text-3xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.textColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 h-1 w-0 rounded-full bg-gradient-to-r ${stat.gradient} transition-all duration-500 group-hover:w-full`} />
              </div>
            )
          })}
        </div>

        {highPriorityCount > 0 && (
          <div className="mb-8 animate-slide-up rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  {highPriorityCount} ticket{highPriorityCount > 1 ? 's' : ''} con prioridad alta o crítica
                </p>
                <p className="text-xs text-red-600/70">Requieren atención inmediata</p>
              </div>
              <Link
                href="/tickets?priority=high"
                className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm ring-1 ring-red-200 transition-all hover:bg-red-50"
              >
                Ver tickets
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {tickets.length > 0 && (
          <div className="animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Tickets Recientes</h2>
              <Link
                href="/tickets"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-500"
              >
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket, i) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="animate-fade-in group block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                        ticket.status === 'open' ? 'bg-amber-50 text-amber-600' :
                        ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {ticket.title}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{ticket.users?.name || 'Usuario'}</span>
                          <span>·</span>
                          <span>{new Date(ticket.created_at).toLocaleDateString('es-MX')}</span>
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ticket.status === 'open' ? 'bg-amber-50 text-amber-700' :
                        ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {ticket.status === 'open' ? 'Abierto' :
                         ticket.status === 'in_progress' ? 'Progreso' : 'Resuelto'}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        ticket.priority === 'critical' || ticket.priority === 'high'
                          ? 'bg-red-50 text-red-600'
                          : ticket.priority === 'medium'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {ticket.priority === 'critical' ? 'Crítica' :
                         ticket.priority === 'high' ? 'Alta' :
                         ticket.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tickets.length === 0 && (
          <div className="animate-fade-in rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
              <TicketIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No hay tickets aún</h3>
            <p className="mt-2 text-sm text-gray-500">Crea tu primer ticket para comenzar.</p>
            <Link
              href="/tickets/new"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Crear Ticket
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
