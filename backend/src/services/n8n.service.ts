import { supabase } from '../lib/supabase'

const N8N_EMAIL_WEBHOOK = process.env.N8N_WEBHOOK_EMAIL_URL
const N8N_SLACK_WEBHOOK = process.env.N8N_WEBHOOK_SLACK_URL

console.log('[n8n] EMAIL_WEBHOOK configurado:', !!N8N_EMAIL_WEBHOOK)
console.log('[n8n] SLACK_WEBHOOK configurado:', !!N8N_SLACK_WEBHOOK)

export async function notifyTicketCreated(
  ticketId: string,
  title: string,
  userId: string,
): Promise<void> {
  try {
    if (!N8N_EMAIL_WEBHOOK) {
      console.log('[n8n] EMAIL_WEBHOOK no configurado, saltando')
      return
    }

    console.log('[n8n] Iniciando notifyTicketCreated para ticket:', ticketId)

    const { data: user } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single()

    if (!user) {
      console.log('[n8n] Usuario no encontrado:', userId)
      return
    }

    const payload = {
      emailTo: user.email,
      subject: `Ticket creado: ${title}`,
      message: `Hola ${user.name},\n\nTu ticket "${title}" ha sido creado exitosamente. ID: ${ticketId}\n\nPronto un agente lo atenderá.`,
    }

    console.log('[n8n] Enviando email a n8n:', JSON.stringify(payload))
    console.log('[n8n] URL:', N8N_EMAIL_WEBHOOK)

    const res = await fetch(N8N_EMAIL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    console.log('[n8n] Respuesta email status:', res.status, 'text:', await res.text().catch(() => ''))
  } catch (err) {
    console.error('[n8n] Error en notifyTicketCreated:', err)
  }
}

export async function notifyHighPriority(
  ticketId: string,
  title: string,
  priority: string,
  userId: string,
): Promise<void> {
  try {
    if (!N8N_SLACK_WEBHOOK) {
      console.log('[n8n] SLACK_WEBHOOK no configurado, saltando')
      return
    }

    console.log('[n8n] Iniciando notifyHighPriority para ticket:', ticketId)

    const { data: user } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single()

    const payload = {
      slackChannel: '#soporte-alertas',
      message: `🔴 *Ticket de alta prioridad*\n*ID:* ${ticketId}\n*Título:* ${title}\n*Prioridad:* ${priority}\n*Usuario:* ${user?.name || 'Desconocido'}`,
    }

    console.log('[n8n] Enviando slack a n8n:', JSON.stringify(payload))
    console.log('[n8n] URL Slack:', N8N_SLACK_WEBHOOK)

    const res = await fetch(N8N_SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    console.log('[n8n] Respuesta slack status:', res.status, 'text:', await res.text().catch(() => ''))
  } catch (err) {
    console.error('[n8n] Error en notifyHighPriority:', err)
  }
}
