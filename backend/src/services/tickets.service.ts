import { supabase } from '../lib/supabase'
import { Ticket, TicketWithUser, TicketStatus, TicketPriority } from '../types'

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

const TICKET_SELECT = '*, users:users(name, email)'

export async function getTickets(filters?: {
  status?: TicketStatus
  priority?: TicketPriority
  user_id?: string
  assigned_to?: string
}): Promise<TicketWithUser[]> {
  let query = supabase.from('tickets').select(TICKET_SELECT)

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.priority) query = query.eq('priority', filters.priority)
  if (filters?.user_id) query = query.eq('user_id', filters.user_id)
  if (filters?.assigned_to) query = query.eq('assigned_to', filters.assigned_to)

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data as TicketWithUser[]) || []
}

export async function getTicketById(id: string): Promise<TicketWithUser> {
  const { data, error } = await supabase
    .from('tickets')
    .select(TICKET_SELECT)
    .eq('id', id)
    .single()

  if (error || !data) throw new Error('Ticket no encontrado')
  return data as TicketWithUser
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
