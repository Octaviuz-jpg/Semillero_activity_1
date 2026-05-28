'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge'
import AIPanel from '@/components/AIPanel'
import type { Ticket, Comment, TicketStatus } from '@/types'

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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  const canChangeStatus = user?.role === 'admin' || user?.role === 'agent'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => router.push('/tickets')}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Volver a tickets
      </button>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
            <p className="mt-1 text-xs text-gray-400">
              {ticket.users?.name || 'Usuario'} · Creado {new Date(ticket.created_at).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="ml-4 flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm text-gray-700">{ticket.description}</p>

        {canChangeStatus && (
          <div className="mt-6 border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cambiar estado
            </label>
            <div className="flex gap-2">
              {(['open', 'in_progress', 'resolved'] as TicketStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={ticket.status === status}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                    ticket.status === status
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'open' ? 'Abrir' : status === 'in_progress' ? 'En Progreso' : 'Resolver'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {canChangeStatus && token && (
        <AIPanel
          ticket={ticket}
          token={token}
          onSelectSuggestion={(text) => setNewComment(text)}
        />
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-6">
          Comentarios ({comments.length})
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-5 mb-8">
          {comments.map((comment) => {
            const role = comment.user?.role || 'user'
            const style = roleStyles[role] || roleStyles.user
            const name = comment.user?.name || 'Usuario'
            const roleLabel = roleLabels[role] || 'Usuario'
            const isAi = comment.is_ai_suggested

            return (
              <div key={comment.id} className={`flex ${style.align}`}>
                <div className={`flex gap-3 max-w-[80%] ${role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      role === 'admin' ? 'bg-purple-500' : role === 'agent' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}
                    title={name}
                  >
                    {getInitials(name)}
                  </div>

                  <div className={`flex flex-col ${role === 'user' ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-700">{name}</span>
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

                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isAi ? 'bg-amber-50 border border-amber-200 text-amber-900' : `${style.bg} border ${style.border} text-gray-800`
                    }`}>
                      {isAi && (
                        <span className="block text-[10px] font-medium text-amber-600 mb-1">
                          Sugerido por IA
                        </span>
                      )}
                      <p className="whitespace-pre-wrap">{comment.content}</p>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-1">
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
            <p className="text-sm text-gray-400 text-center py-8">
              Sin comentarios aún. Sé el primero en responder.
            </p>
          )}
        </div>

        <form onSubmit={handleAddComment} className="border-t pt-6">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Agregar comentario
          </label>
          <textarea
            id="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            placeholder="Escribe tu respuesta aquí..."
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {submitting ? 'Enviando...' : 'Enviar comentario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}