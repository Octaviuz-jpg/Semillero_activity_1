'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import type { Ticket } from '@/types'

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

const taskLabels: Record<AiTask, string> = {
  classify: 'Clasificar',
  summarize: 'Resumir',
  'suggest-reply': 'Sugerir Respuesta',
  'risk-analysis': 'Analizar Riesgo',
  'next-action': 'Siguiente Acción',
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

  async function handleApprove(action: string) {
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
    <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h2 className="text-lg font-semibold text-blue-900 mb-3">
        Asistente IA
      </h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(taskLabels) as AiTask[]).map((task) => (
          <button
            key={task}
            onClick={() => handleTask(task)}
            disabled={loading !== null}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              loading === task
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
            }`}
          >
            {loading === task ? 'Procesando...' : taskLabels[task]}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {result && (
        <div className="space-y-3 bg-white rounded-md p-4 border border-blue-100">
          {result.summary && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Resumen</p>
              <p className="text-sm text-gray-800">{result.summary}</p>
            </div>
          )}

          {result.classification && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Clasificación</p>
              <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {result.classification}
              </span>
            </div>
          )}

          {result.riskLevel && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Nivel de Riesgo</p>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                result.riskLevel === 'critical' || result.riskLevel === 'high'
                  ? 'bg-red-100 text-red-800'
                  : result.riskLevel === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {result.riskLevel === 'critical' ? 'Crítico' :
                 result.riskLevel === 'high' ? 'Alto' :
                 result.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
              </span>
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Sugerencias</p>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => onSelectSuggestion?.(s)}
                      className="w-full text-left text-sm text-gray-700 bg-gray-50 rounded p-2 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.nextAction && (
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Acción Recomendada</p>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  result.nextAction === 'escalate' ? 'bg-red-100 text-red-800' :
                  result.nextAction === 'close' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {result.nextAction === 'assign' ? 'Asignar' :
                   result.nextAction === 'escalate' ? 'Escalar' :
                   result.nextAction === 'close' ? 'Cerrar' :
                   'Pedir más datos'}
                </span>

                {criticalActions.includes(result.nextAction) ? (
                  <button
                    onClick={() => setPendingAction({ action: result.nextAction!, logId: '' })}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Requiere aprobación
                  </button>
                ) : (
                  <button
                    onClick={() => setResult(null)}
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Confirmar acción?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Estás a punto de{' '}
              <strong>{pendingAction.action === 'escalate' ? 'escalar' : 'cerrar'}</strong> este ticket.
              Esta acción requiere aprobación manual.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingAction(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleApprove(pendingAction.action)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
