'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge'
import AIPanel from '@/components/AIPanel'
import type { Ticket, Comment, TicketStatus } from '@/types'

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
      setComments((prev) => [...prev, comment])
      setNewComment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar comentario')
    } finally {
      setSubmitting(false)
    }
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
              Creado {new Date(ticket.created_at).toLocaleDateString('es-MX', {
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
        <AIPanel ticket={ticket} token={token} />
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">
          Comentarios ({comments.length})
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Agregar un comentario..."
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Comentar'}
          </button>
        </form>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {comment.is_ai_suggested && (
                  <span className="ml-2 text-blue-500">Sugerido por IA</span>
                )}
              </p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              Sin comentarios aún
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
