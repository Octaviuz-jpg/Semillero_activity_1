import { supabase } from '../lib/supabase'
import { Comment, CommentWithUser } from '../types'

export async function getCommentsByTicket(ticketId: string): Promise<CommentWithUser[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  const comments = (data as Comment[]) || []

  const userIds = [...new Set(comments.map((c) => c.user_id))]
  const { data: users } = await supabase
    .from('users')
    .select('id, name, role')
    .in('id', userIds)

  const userMap = new Map((users || []).map((u) => [u.id, { name: u.name, role: u.role }]))

  return comments.map((c) => ({
    ...c,
    user: userMap.get(c.user_id) ?? { name: 'Desconocido', role: 'user' as const },
  }))
}

export async function createComment(
  ticketId: string,
  userId: string,
  content: string,
  isAiSuggested = false,
): Promise<Comment> {
  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      ticket_id: ticketId,
      user_id: userId,
      content,
      is_ai_suggested: isAiSuggested,
    })
    .select()
    .single()

  if (error || !comment) throw new Error(error?.message || 'Error al crear comentario')

  await supabase
    .from('tickets')
    .update({ status: 'in_progress' })
    .eq('id', ticketId)
    .eq('status', 'open')

  return comment as Comment
}