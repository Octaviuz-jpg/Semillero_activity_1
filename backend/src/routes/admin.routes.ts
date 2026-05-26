import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/roles.middleware'
import { supabase } from '../lib/supabase'
import { Role } from '../types'

const router = Router()

router.get('/users', authenticate, authorize('admin'), async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, name, role, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return res.json(data)
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener usuarios' })
  }
})

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'agent', 'user'] as const),
})

router.patch('/users/:id/role', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { role } = updateRoleSchema.parse(req.body)

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, email, username, name, role, created_at')
      .single()

    if (error || !data) throw new Error(error?.message || 'Usuario no encontrado')
    return res.json(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Rol inválido', details: error.errors })
    }
    return res.status(500).json({ error: 'Error al actualizar rol' })
  }
})

router.get('/metrics', authenticate, authorize('admin'), async (_req: Request, res: Response) => {
  try {
    const { data: tickets } = await supabase.from('tickets').select('*')
    const { data: users } = await supabase.from('users').select('id, role')
    const total = tickets?.length || 0
    const open = tickets?.filter((t) => t.status === 'open').length || 0
    const inProgress = tickets?.filter((t) => t.status === 'in_progress').length || 0
    const resolved = tickets?.filter((t) => t.status === 'resolved').length || 0
    const critical = tickets?.filter((t) => t.priority === 'high' || t.priority === 'critical').length || 0
    const agents = users?.filter((u) => u.role === 'agent').length || 0
    const admins = users?.filter((u) => u.role === 'admin').length || 0
    const endUsers = users?.filter((u) => u.role === 'user').length || 0

    const avgResolutionTime = (() => {
      const resolvedTickets = tickets?.filter((t) => t.status === 'resolved' && t.updated_at)
      if (!resolvedTickets || resolvedTickets.length === 0) return 0
      const totalMs = resolvedTickets.reduce((acc, t) => {
        return acc + (new Date(t.updated_at).getTime() - new Date(t.created_at).getTime())
      }, 0)
      return Math.round(totalMs / resolvedTickets.length / (1000 * 60 * 60))
    })()

    res.json({
      tickets: { total, open, inProgress, resolved, critical },
      users: { total: users?.length || 0, agents, admins, endUsers },
      avgResolutionTimeHours: avgResolutionTime,
    })
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener métricas' })
  }
})

export default router
