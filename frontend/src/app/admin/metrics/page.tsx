'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { AdminMetrics } from '@/types'

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
    return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Cargando...</p></div>
  }

  if (!metrics) {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Cargando métricas...</p></div>
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Métricas</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Tickets</p>
          <p className="mt-1 text-3xl font-bold">{metrics.tickets.total}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Abiertos</p>
          <p className="mt-1 text-3xl font-bold text-yellow-600">{metrics.tickets.open}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">En Progreso</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{metrics.tickets.inProgress}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Resueltos</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{metrics.tickets.resolved}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Críticos / Alta</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{metrics.tickets.critical}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Tiempo Promedio Resolución</p>
          <p className="mt-1 text-3xl font-bold">{metrics.avgResolutionTimeHours}h</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Agentes</p>
          <p className="mt-1 text-3xl font-bold">{metrics.users.agents}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Usuarios Finales</p>
          <p className="mt-1 text-3xl font-bold">{metrics.users.endUsers}</p>
        </div>
      </div>
    </div>
  )
}
