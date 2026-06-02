'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import type { AdminMetrics } from '@/types'
import { Ticket as TicketIcon, Circle, Clock, CheckCircle2, AlertTriangle, Clock9, Users, UserCircle, BarChart3 } from 'lucide-react'

export default function AdminMetricsPage() {
  const { user, isLoading, token } = useAuth()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!token) return
    api.get<AdminMetrics>('/admin/metrics', token!)
      .then(setMetrics)
      .catch(() => setError('Error al cargar métricas'))
  }, [token])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span className="text-sm">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span className="text-sm">Cargando métricas...</span>
          </div>
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Total Tickets', value: metrics.tickets.total, icon: TicketIcon, bg: 'bg-gray-50', textColor: 'text-gray-700' },
    { label: 'Abiertos', value: metrics.tickets.open, icon: Circle, bg: 'bg-amber-50', textColor: 'text-amber-600' },
    { label: 'En Progreso', value: metrics.tickets.inProgress, icon: Clock, bg: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Resueltos', value: metrics.tickets.resolved, icon: CheckCircle2, bg: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'Críticos / Alta', value: metrics.tickets.critical, icon: AlertTriangle, bg: 'bg-red-50', textColor: 'text-red-600' },
    { label: 'Tiempo Prom. Resolución', value: `${metrics.avgResolutionTimeHours}h`, icon: Clock9, bg: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Agentes', value: metrics.users.agents, icon: Users, bg: 'bg-cyan-50', textColor: 'text-cyan-600' },
    { label: 'Usuarios Finales', value: metrics.users.endUsers, icon: UserCircle, bg: 'bg-orange-50', textColor: 'text-orange-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 text-purple-600 ring-1 ring-purple-100">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Métricas</h1>
            <p className="text-sm text-gray-500">Estadísticas generales de la plataforma</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 animate-slide-down rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="animate-slide-up rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    <p className={`mt-1 text-3xl font-bold ${card.textColor}`}>
                      {card.value}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.textColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
