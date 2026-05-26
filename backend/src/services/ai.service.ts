import { groq, GROQ_MODEL } from '../lib/groq'
import { supabase } from '../lib/supabase'
import { AiOutput } from '../types'

interface AiInput {
  ticketId: string
  title: string
  description: string
  userId?: string
  role?: string
  category?: string
}

type AiTask = 'classify' | 'summarize' | 'suggest-reply' | 'risk-analysis' | 'next-action'

const SYSTEM_PROMPTS: Record<AiTask, string> = {
  classify: `Eres un clasificador de tickets de soporte técnico. Analiza el ticket y devuelve JSON:
{
  "summary": "resumen breve del ticket",
  "classification": "bug | feature | question | incident",
  "suggestions": [],
  "riskLevel": "low | medium | high | critical",
  "nextAction": ""
}

Determina prioridad según: criticidad, impacto, urgencia.
Clasifica el sentimiento del usuario (frustrado, urgente, normal, etc.) en la classification.`,
  summarize: `Eres un resumidor de tickets de soporte técnico. Devuelve JSON:
{
  "summary": "resumen ejecutivo del problema en 2-3 oraciones",
  "classification": "",
  "suggestions": [],
  "riskLevel": "",
  "nextAction": ""
}`,
  'suggest-reply': `Eres un agente de soporte técnico. Basado en el ticket, redacta una respuesta profesional y empática. Devuelve JSON:
{
  "summary": "",
  "classification": "",
  "suggestions": ["respuesta profesional al usuario", "alternativa si aplica"],
  "riskLevel": "",
  "nextAction": ""
}`,
  'risk-analysis': `Eres un analista de riesgos de soporte técnico. Evalúa el riesgo de escalamiento del ticket. Devuelve JSON:
{
  "summary": "análisis de riesgo detallado",
  "classification": "",
  "suggestions": ["acción preventiva 1", "acción preventiva 2"],
  "riskLevel": "low | medium | high | critical",
  "nextAction": ""
}

Considera: lenguaje del usuario, criticidad del problema, impacto en negocio.`,
  'next-action': `Eres un orquestador de soporte técnico. Basado en el ticket, recomienda la siguiente acción operativa. Devuelve JSON:
{
  "summary": "justificación de la acción recomendada",
  "classification": "",
  "suggestions": [],
  "riskLevel": "low | medium | high | critical",
  "nextAction": "assign | escalate | close | request_info"
}`,
}

async function logAiCall(
  ticketId: string,
  prompt: string,
  model: string,
  latencyMs: number,
  response: AiOutput,
  approvedBy: string | null = null,
) {
  await supabase.from('ai_logs').insert({
    ticket_id: ticketId,
    prompt,
    model,
    latency_ms: latencyMs,
    response: JSON.stringify(response),
    approved_by: approvedBy,
  })
}

async function callAi(input: AiInput, task: AiTask): Promise<AiOutput> {
  const systemPrompt = SYSTEM_PROMPTS[task]
  const userPrompt = `Ticket ID: ${input.ticketId}
Título: ${input.title}
Descripción: ${input.description}
${input.category ? `Categoría: ${input.category}` : ''}
${input.role ? `Rol del usuario: ${input.role}` : ''}

Devuelve SOLO JSON válido, sin explicaciones adicionales.`

  const start = Date.now()

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const latencyMs = Date.now() - start
  const content = completion.choices[0]?.message?.content || '{}'
  const result: AiOutput = JSON.parse(content)

  await logAiCall(input.ticketId, `${systemPrompt}\n\n${userPrompt}`, GROQ_MODEL, latencyMs, result)

  return result
}

export async function classifyTicket(input: AiInput): Promise<AiOutput> {
  return callAi(input, 'classify')
}

export async function summarizeTicket(input: AiInput): Promise<AiOutput> {
  return callAi(input, 'summarize')
}

export async function suggestReply(input: AiInput): Promise<AiOutput> {
  return callAi(input, 'suggest-reply')
}

export async function analyzeRisk(input: AiInput): Promise<AiOutput> {
  return callAi(input, 'risk-analysis')
}

export async function recommendNextAction(input: AiInput): Promise<AiOutput> {
  return callAi(input, 'next-action')
}

export async function approveAiAction(aiLogId: string, userId: string): Promise<void> {
  await supabase
    .from('ai_logs')
    .update({ approved_by: userId })
    .eq('id', aiLogId)
}
