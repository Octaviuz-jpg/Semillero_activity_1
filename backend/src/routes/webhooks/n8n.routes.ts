import { Router, Request, Response } from 'express'
import { supabase } from '../../lib/supabase'

const router = Router()

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'n8n webhooks ready' })
})

router.post('/ticket-created', async (req: Request, res: Response) => {
  try {
    const { ticketId, title, userId } = req.body

    const { data: user } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single()

    res.json({
      success: true,
      emailTo: user?.email || 'unknown',
      subject: `Ticket creado: ${title}`,
      message: `Hola ${user?.name || 'usuario'},\n\nTu ticket "${title}" ha sido creado exitosamente. ID: ${ticketId}\n\nPronto un agente lo atenderá.`,
    })
  } catch (error) {
    res.status(500).json({ error: 'Error en webhook ticket-created' })
  }
})

router.post('/high-priority-alert', async (req: Request, res: Response) => {
  try {
    const { ticketId, title, priority, userId } = req.body

    const { data: user } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single()

    res.json({
      success: true,
      slackChannel: '#soporte-alertas',
      message: `🔴 *Ticket de alta prioridad*\n*ID:* ${ticketId}\n*Título:* ${title}\n*Prioridad:* ${priority}\n*Usuario:* ${user?.name || 'Desconocido'}`,
    })
  } catch (error) {
    res.status(500).json({ error: 'Error en webhook high-priority-alert' })
  }
})

router.get('/daily-summary', async (_req: Request, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString())

    const total = tickets?.length || 0
    const open = tickets?.filter((t) => t.status === 'open').length || 0
    const resolved = tickets?.filter((t) => t.status === 'resolved').length || 0
    const critical = tickets?.filter((t) => t.priority === 'high' || t.priority === 'critical').length || 0

    res.json({
      date: yesterday.toISOString().split('T')[0],
      total,
      open,
      resolved,
      critical,
      tickets: tickets || [],
    })
  } catch (error) {
    res.status(500).json({ error: 'Error en webhook daily-summary' })
  }
})

export default router
