import type { TicketStatus, TicketPriority } from '@/types'
import { Circle, Clock, CheckCircle2, ArrowDown, ArrowUp, AlertTriangle, Gauge } from 'lucide-react'

const statusConfig: Record<TicketStatus, { label: string; icon: typeof Circle; className: string }> = {
  open: {
    label: 'Abierto',
    icon: Circle,
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  in_progress: {
    label: 'En Progreso',
    icon: Clock,
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  resolved: {
    label: 'Resuelto',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
}

const priorityConfig: Record<TicketPriority, { label: string; icon: typeof ArrowUp; className: string }> = {
  low: {
    label: 'Baja',
    icon: ArrowDown,
    className: 'bg-gray-50 text-gray-600 border border-gray-200',
  },
  medium: {
    label: 'Media',
    icon: Gauge,
    className: 'bg-blue-50 text-blue-600 border border-blue-200',
  },
  high: {
    label: 'Alta',
    icon: ArrowUp,
    className: 'bg-orange-50 text-orange-600 border border-orange-200',
  },
  critical: {
    label: 'Crítica',
    icon: AlertTriangle,
    className: 'bg-red-50 text-red-600 border border-red-200',
  },
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const { label, icon: Icon, className } = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const { label, icon: Icon, className } = priorityConfig[priority]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}
