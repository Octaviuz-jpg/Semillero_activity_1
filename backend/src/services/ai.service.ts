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

const RISK_CRITERIA = `CRITERIOS PARA riskLevel (SOLO estos valores, en inglés):
- "low": problema menor, sin impacto en negocio, usuario calmado
- "medium": problema moderado, impacto parcial, usuario normal
- "high": problema grave, impacto en operaciones, usuario frustrado
- "critical": problema crítico, servicio caído, usuario urgente, riesgo de escalamiento`

const SYSTEM_PROMPTS: Record<AiTask, string> = {
  classify: `Eres un clasificador de tickets de soporte técnico. Analiza el ticket y devuelve JSON:
{
  "summary": "resumen breve del ticket en español",
  "classification": "bug | feature | question | incident",
  "suggestions": [],
  "riskLevel": "low | medium | high | critical",
  "nextAction": ""
}

${RISK_CRITERIA}
Clasifica el tipo de problema en classification.`,
  summarize: `Eres un resumidor de tickets de soporte técnico. Devuelve JSON:
{
  "summary": "resumen ejecutivo del problema en 2-3 oraciones en español",
  "classification": "bug | feature | question | incident",
  "suggestions": [],
  "riskLevel": "low | medium | high | critical",
  "nextAction": ""
}

${RISK_CRITERIA}`,
  'suggest-reply': `Eres un agente de soporte técnico. Basado en el ticket, redacta una respuesta profesional y empática. Devuelve JSON:
{
  "summary": "breve contexto del ticket en español",
  "classification": "",
  "suggestions": ["respuesta profesional al usuario", "alternativa si aplica"],
  "riskLevel": "low | medium | high | critical",
  "nextAction": ""
}

${RISK_CRITERIA}`,
  'risk-analysis': `Eres un analista de riesgos de soporte técnico. Evalúa el riesgo de escalamiento del ticket. Devuelve JSON:
{
  "summary": "análisis de riesgo detallado en español",
  "classification": "",
  "suggestions": ["acción preventiva 1", "acción preventiva 2"],
  "riskLevel": "low | medium | high | critical",
  "nextAction": ""
}

${RISK_CRITERIA}
Considera: lenguaje del usuario, criticidad del problema, impacto en negocio.`,
  'next-action': `Eres un orquestador de soporte técnico. Basado en el ticket, recomienda la siguiente acción operativa. Devuelve JSON:
{
  "summary": "justificación de la acción recomendada en español",
  "classification": "",
  "suggestions": [],
  "riskLevel": "low | medium | high | critical",
  "nextAction": "assign | escalate | close | request_info"
}

${RISK_CRITERIA}
Para nextAction usa SOLO: "assign" (asignar agente), "escalate" (escalar a nivel superior), "close" (cerrar ticket), "request_info" (pedir más datos).`,
}

function normalizeOutput(raw: AiOutput): AiOutput {
  const riskMap: Record<string, AiOutput['riskLevel']> = {
    'low': 'low', 'bajo': 'low', 'baja': 'low',
    'medium': 'medium', 'medio': 'medium', 'media': 'medium',
    'high': 'high', 'alto': 'high', 'alta': 'high',
    'critical': 'critical', 'crítico': 'critical', 'critico': 'critical', 'crítica': 'critical',
  }

  const actionMap: Record<string, AiOutput['nextAction']> = {
    'assign': 'assign', 'asignar': 'assign',
    'escalate': 'escalate', 'escalar': 'escalate',
    'close': 'close', 'cerrar': 'close',
    'request_info': 'request_info', 'pedir más datos': 'request_info', 'solicitar más información': 'request_info',
  }

  const classificationMap: Record<string, string> = {
    'bug': 'bug', 'error': 'bug', 'fallo': 'bug',
    'feature': 'feature', 'feature request': 'feature', 'solicitud': 'feature',
    'question': 'question', 'pregunta': 'question', 'consulta': 'question', 'duda': 'question',
    'incident': 'incident', 'incidente': 'incident',
  }

  const riskKey = raw.riskLevel?.toLowerCase().trim() || ''
  const actionKey = raw.nextAction?.toLowerCase().trim() || ''
  const classKey = raw.classification?.toLowerCase().trim() || ''

  return {
    summary: raw.summary || '',
    classification: classificationMap[classKey] || raw.classification || '',
    suggestions: raw.suggestions || [],
    riskLevel: riskMap[riskKey] || 'medium',
    nextAction: actionMap[actionKey] || 'request_info',
  }
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
  const parsed: AiOutput = JSON.parse(content)
  const result = normalizeOutput(parsed)

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
