'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import Navbar from '@/components/Navbar'
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge'
import AIPanel from '@/components/AIPanel'
import type { Ticket, Comment, TicketStatus } from '@/types'
import { ArrowLeft, MessageSquare, Send, Circle, Clock, CheckCircle2 } from 'lucide-react'

const roleStyles: Record<string, { align: string; bg: string; border: string; dot: string }> = {
  user: {
    align: 'justify-start',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
  agent: {
    align: 'justify-end',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  admin: {
    align: 'justify-end',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
}

const roleLabels: Record<string, string> = {
  user: 'Usuario',
  agent: 'Agente',
  admin: 'Admin',
}

const statusButtons: { status: TicketStatus; label: string; icon: typeof Circle; color: string }[] = [
  { status: 'open', label: 'Abrir', icon: Circle, color: 'amber' },
  { status: 'in_progress', label: 'En Progreso', icon: Clock, color: 'blue' },
  { status: 'resolved', label: 'Resolver', icon: CheckCircle2, color: 'emerald' },
]

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { token, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!id || !token) return
    api.get<Ticket>(`/tickets/${id}`, token!)
      .then(setTicket)
      .catch(() => router.push('/tickets'))
    api.get<Comment[]>(`/tickets/${id}/comments`, token!)
      .then(setComments)
      .catch(() => {})
  }, [id, token, router])

  async function handleStatusChange(newStatus: TicketStatus) {
    try {
      const updated = await api.patch<Ticket>(
        `/tickets/${id}`,
        { status: newStatus },
        token!,
      )
      setTicket(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado')
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      const comment = await api.post<Comment>(
        `/tickets/${id}/comments`,
        { content: newComment },
        token!,
      )
      setComments((prev) => [...prev, { ...comment, user: { name: user!.name, role: user!.role } }])
      setNewComment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar comentario')
    } finally {
      setSubmitting(false)
    }
  }

  function getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span className="text-sm">Cargando ticket...</span>
          </div>
        </div>
      </div>
    )
  }

  const canChangeStatus = user?.role === 'admin' || user?.role === 'agent'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <button
          onClick={() => router.push('/tickets')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a tickets
        </button>

        <div className="animate-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
              <p className="mt-2 text-sm text-gray-500">
                {ticket.users?.name || 'Usuario'} · Creado{' '}
                {new Date(ticket.created_at).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {ticket.description}
            </p>
          </div>

          {canChangeStatus && (
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-6">
              <span className="text-sm font-medium text-gray-700 mr-1">Cambiar estado:</span>
              {statusButtons.map((btn) => {
                const Icon = btn.icon
                const isActive = ticket.status === btn.status
                return (
                  <button
                    key={btn.status}
                    onClick={() => handleStatusChange(btn.status)}
                    disabled={isActive}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all active:scale-95 ${
                      isActive
                        ? `bg-${btn.color}-50 text-${btn.color}-400 cursor-not-allowed ring-1 ring-${btn.color}-200`
                        : `bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-${btn.color}-50 hover:text-${btn.color}-700 hover:ring-${btn.color}-200`
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? '' : ''}`} />
                    {btn.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {canChangeStatus && token && (
          <div className="mt-6 animate-slide-up">
            <AIPanel
              ticket={ticket}
              token={token}
              onSelectSuggestion={(text) => setNewComment(text)}
            />
          </div>
        )}

        <div className="mt-8 animate-fade-in">
          <div className="mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Comentarios ({comments.length})
            </h2>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-100">
              {error}
            </div>
          )}

          <div className="space-y-5 mb-8">
            {comments.map((comment) => {
              const role = comment.user?.role || 'user'
              const style = roleStyles[role] || roleStyles.user
              const name = comment.user?.name || 'Usuario'
              const roleLabel = roleLabels[role] || 'Usuario'
              const isAi = comment.is_ai_suggested

              return (
                <div key={comment.id} className={`flex ${style.align} animate-fade-in`}>
                  <div className={`flex gap-3 max-w-[85%] ${role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                        role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : role === 'agent' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}
                      title={name}
                    >
                      {getInitials(name)}
                    </div>

                    <div className={`flex flex-col ${role === 'user' ? 'items-start' : 'items-end'}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-gray-800">{name}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : role === 'agent'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {roleLabel}
                        </span>
                      </div>

                      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        isAi ? 'bg-amber-50 border border-amber-200 text-amber-900' : `${style.bg} border ${style.border} text-gray-800`
                      }`}>
                        {isAi && (
                          <span className="block text-[10px] font-semibold text-amber-600 mb-1">
                            Sugerido por IA
                          </span>
                        )}
                        <p className="whitespace-pre-wrap">{comment.content}</p>
                      </div>

                      <p className="text-[11px] text-gray-400 mt-1.5">
                        {new Date(comment.created_at).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

            {comments.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-500">
                  Sin comentarios aún
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Sé el primero en responder.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleAddComment} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-3">
              Agregar comentario
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition-all placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              placeholder="Escribe tu respuesta aquí..."
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Enviando...' : 'Enviar comentario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
