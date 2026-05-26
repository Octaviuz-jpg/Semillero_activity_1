export type Role = 'admin' | 'agent' | 'user'

export type TicketStatus = 'open' | 'in_progress' | 'resolved'

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  user_id: string
  assigned_to: string | null
  category_id: string | null
  ai_summary: string | null
  ai_classification: string | null
  ai_risk_level: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  ticket_id: string
  user_id: string
  content: string
  is_ai_suggested: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}
