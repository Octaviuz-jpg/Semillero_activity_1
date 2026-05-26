import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.middleware'
import { getCommentsByTicket, createComment } from '../services/comments.service'

const router = Router({ mergeParams: true })

const createSchema = z.object({
  content: z.string().min(1, 'Contenido es requerido'),
})

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const comments = await getCommentsByTicket(req.params.ticketId)
    return res.json(comments)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(500).json({ error: message })
  }
})

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const data = createSchema.parse(req.body)
    const comment = await createComment(req.params.ticketId, req.user!.userId, data.content)
    return res.status(201).json(comment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(500).json({ error: message })
  }
})

export default router
