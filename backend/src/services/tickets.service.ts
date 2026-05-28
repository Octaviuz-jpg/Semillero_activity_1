import { supabase } from '../lib/supabase'
import { Ticket, TicketWithUser, TicketStatus, TicketPriority, User } from '../types'

type CreateTicketInput = {
  title: string
  description: string
  category_id?: string
  user_id: string
}

type UpdateTicketInput = {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: TicketPriority
  assigned_to?: string | null
  category_id?: string | null
}

async function attachUserInfo(tickets: Ticket[]): Promise<TicketWithUser[]> {
  const userIds = [...new Set(tickets.map((t) => t.user_id))]
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email')
    .in('id', userIds)

  const userMap = new Map((users || []).map((u) => [u.id, { name: u.name, email: u.email }]))

  return tickets.map((ticket) => ({
    ...ticket,
    users: userMap.get(ticket.user_id) ?? { name: 'Desconocido', email: '' },
  }))
}

export async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({
      title: data.title,
      description: data.description,
      category_id: data.category_id || null,
      user_id: data.user_id,
    })
    .select()
    .single()

  if (error || !ticket) throw new Error(error?.message || 'Error al crear ticket')
  return ticket as Ticket
}

export async function getTickets(filters?: {
  status?: TicketStatus
  priority?: TicketPriority
  user_id?: string
  assigned_to?: string
}): Promise<TicketWithUser[]> {
  let query = supabase.from('tickets').select('*')

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)
  if (filters?.user_id) query = query.eq('user_id', filters.user_id)
  if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to)

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw new Error(error.message)
  const tickets = (data as Ticket[]) || []

  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  tickets.sort((a, b) => {
    const p = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
    if (p !== 0) return p
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return attachUserInfo(tickets)
}

export async function getTicketById(id: string): Promise<TicketWithUser> {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !ticket) throw new Error('Ticket no encontrado')
  const [enriched] = await attachUserInfo([ticket as Ticket])
  return enriched
}

export async function updateTicket(id: string, updates: UpdateTicketInput): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) throw new Error(error?.message || 'Error al actualizar ticket')
  return data as Ticket
}

export async function deleteTicket(id: string): Promise<void> {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
