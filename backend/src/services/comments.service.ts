import { supabase } from '../lib/supabase'
import { Comment } from '../types'

export async function getCommentsByTicket(ticketId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data as Comment[]) || []
}

export async function createComment(
  ticketId: string,
  userId: string,
  content: string,
  isAiSuggested = false,
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      ticket_id: ticketId,
      user_id: userId,
      content,
      is_ai_suggested: isAiSuggested,
    })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message || 'Error al crear comentario')
  return data as Comment
}
