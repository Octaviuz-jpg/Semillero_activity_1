export type Role = 'admin' | 'agent' | 'user'

export type TicketStatus = 'open' | 'in_progress' | 'resolved'

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export interface User {
  id: string
  email: string
  username: string
  password_hash: string
  role: Role
  name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

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

export interface Notification {
  id: string
  user_id: string
  type: string
  message: string
  read: boolean
  ticket_id: string | null
  created_at: string
}

export interface AiLog {
  id: string
  ticket_id: string
  prompt: string
  model: string
  latency_ms: number
  response: string
  approved_by: string | null
  created_at: string
}

export interface AiOutput {
  summary: string
  classification: string
  suggestions: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  nextAction: 'assign' | 'escalate' | 'close' | 'request_info'
}

export interface JwtPayload {
  userId: string
  email: string
  role: Role
}
