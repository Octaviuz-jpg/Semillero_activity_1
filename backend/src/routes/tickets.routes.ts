import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/roles.middleware'
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} from '../services/tickets.service'

const router = Router()

const createSchema = z.object({
  title: z.string().min(1, 'Título es requerido').max(255),
  description: z.string().min(1, 'Descripción es requerida'),
  category_id: z.string().uuid().optional(),
})

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
})

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const filters: Record<string, string> = {}
    if (req.query.status) filters.status = req.query.status as string
    if (req.query.priority) filters.priority = req.query.priority as string
    if (req.query.user_id) filters.user_id = req.query.user_id as string
    if (req.query.assigned_to) filters.assigned_to = req.query.assigned_to as string

    const tickets = await getTickets(
      Object.keys(filters).length > 0 ? filters : undefined,
    )
    return res.json(tickets)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(500).json({ error: message })
  }
})

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const ticket = await getTicketById(req.params.id)
    return res.json(ticket)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(404).json({ error: message })
  }
})

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const data = createSchema.parse(req.body)
    const ticket = await createTicket({
      ...data,
      user_id: req.user!.userId,
    })
    return res.status(201).json(ticket)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(500).json({ error: message })
  }
})

router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const data = updateSchema.parse(req.body)
    const ticket = await updateTicket(req.params.id, data)
    return res.json(ticket)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(500).json({ error: message })
  }
})

router.delete('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    await deleteTicket(req.params.id)
    return res.status(204).send()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(500).json({ error: message })
  }
})

export default router
