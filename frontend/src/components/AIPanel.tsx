'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import type { Ticket } from '@/types'
import { Sparkles, FileText, ListTree, MessageSquareText, AlertTriangle, ArrowRightCircle, Loader2, X, CheckCircle2 } from 'lucide-react'

interface AiOutput {
  summary: string
  classification: string
  suggestions: string[]
  riskLevel: string
  nextAction: string
}

interface AIPanelProps {
  ticket: Ticket
  token: string
  onSelectSuggestion?: (text: string) => void
}

type AiTask = 'classify' | 'summarize' | 'suggest-reply' | 'risk-analysis' | 'next-action'

const taskConfig: Record<AiTask, { label: string; icon: typeof Sparkles }> = {
  classify: { label: 'Clasificar', icon: ListTree },
  summarize: { label: 'Resumir', icon: FileText },
  'suggest-reply': { label: 'Sugerir Respuesta', icon: MessageSquareText },
  'risk-analysis': { label: 'Analizar Riesgo', icon: AlertTriangle },
  'next-action': { label: 'Siguiente Acción', icon: ArrowRightCircle },
}

const criticalActions = ['escalate', 'close']

export default function AIPanel({ ticket, token, onSelectSuggestion }: AIPanelProps) {
  const [loading, setLoading] = useState<AiTask | null>(null)
  const [result, setResult] = useState<AiOutput | null>(null)
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState<{ action: string; logId: string } | null>(null)

  async function handleTask(task: AiTask) {
    setLoading(task)
    setError('')
    setResult(null)
    try {
      const data = await api.post<AiOutput>(
        `/ai/${task}`,
        {
          ticketId: ticket.id,
          title: ticket.title,
          description: ticket.description,
        },
        token,
      )
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar con IA')
    } finally {
      setLoading(null)
    }
  }

  async function handleApprove() {
    if (!result) return
    try {
      await api.post('/ai/approve', { aiLogId: '' }, token)
      setPendingAction(null)
      setResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar')
    }
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Asistente IA
        </h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(taskConfig) as AiTask[]).map((task) => {
          const { label, icon: Icon } = taskConfig[task]
          const isActive = loading === task
          return (
            <button
              key={task}
              onClick={() => handleTask(task)}
              disabled={loading !== null}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-blue-200 hover:text-blue-700'
              }`}
            >
              {isActive ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              {isActive ? 'Procesando...' : label}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="mb-4 animate-slide-down rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-100">
          {error}
        </div>
      )}

      {result && (
        <div className="animate-fade-in space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-blue-100">
          {result.summary && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Resumen</p>
              <p className="text-sm leading-relaxed text-gray-800">{result.summary}</p>
            </div>
          )}

          {result.classification && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Clasificación</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                <ListTree className="h-3 w-3" />
                {result.classification}
              </span>
            </div>
          )}

          {result.riskLevel && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Nivel de Riesgo</p>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                result.riskLevel === 'critical' || result.riskLevel === 'high'
                  ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                  : result.riskLevel === 'medium'
                  ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                  : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              }`}>
                <AlertTriangle className="h-3 w-3" />
                {result.riskLevel === 'critical' ? 'Crítico' :
                 result.riskLevel === 'high' ? 'Alto' :
                 result.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
              </span>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Sugerencias</p>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => onSelectSuggestion?.(s)}
                      className="group w-full text-left rounded-xl bg-gray-50 p-3 text-sm text-gray-700 ring-1 ring-gray-200 transition-all hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200 cursor-pointer"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.nextAction && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Acción Recomendada</p>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                  result.nextAction === 'escalate' ? 'bg-red-50 text-red-700 ring-1 ring-red-200' :
                  result.nextAction === 'close' ? 'bg-gray-50 text-gray-700 ring-1 ring-gray-200' :
                  'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                }`}>
                  <ArrowRightCircle className="h-3 w-3" />
                  {result.nextAction === 'assign' ? 'Asignar' :
                   result.nextAction === 'escalate' ? 'Escalar' :
                   result.nextAction === 'close' ? 'Cerrar' :
                   'Pedir más datos'}
                </span>

                {criticalActions.includes(result.nextAction) ? (
                  <button
                    onClick={() => setPendingAction({ action: result.nextAction!, logId: '' })}
                    className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Aprobar
                  </button>
                ) : (
                  <button
                    onClick={() => setResult(null)}
                    className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-95"
                  >
                    Ejecutar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="animate-scale-in w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">¿Confirmar acción?</h3>
              <button onClick={() => setPendingAction(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 mb-6">
              Estás a punto de{' '}
              <strong>{pendingAction.action === 'escalate' ? 'escalar' : 'cerrar'}</strong> este ticket.
              Esta acción requiere aprobación manual.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingAction(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleApprove()}
                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-95"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
