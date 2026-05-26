import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.middleware'
import {
  classifyTicket,
  summarizeTicket,
  suggestReply,
  analyzeRisk,
  recommendNextAction,
  approveAiAction,
} from '../services/ai.service'

const router = Router()

const aiInputSchema = z.object({
  ticketId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().optional(),
})

const approveSchema = z.object({
  aiLogId: z.string().uuid(),
})

router.post('/classify', authenticate, async (req: Request, res: Response) => {
  try {
    const input = aiInputSchema.parse(req.body)
    const result = await classifyTicket({ ...input, userId: req.user!.userId, role: req.user!.role })
    return res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    return res.status(500).json({ error: 'Error al clasificar ticket' })
  }
})

router.post('/summarize', authenticate, async (req: Request, res: Response) => {
  try {
    const input = aiInputSchema.parse(req.body)
    const result = await summarizeTicket({ ...input, userId: req.user!.userId, role: req.user!.role })
    return res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    return res.status(500).json({ error: 'Error al resumir ticket' })
  }
})

router.post('/suggest-reply', authenticate, async (req: Request, res: Response) => {
  try {
    const input = aiInputSchema.parse(req.body)
    const result = await suggestReply({ ...input, userId: req.user!.userId, role: req.user!.role })
    return res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    return res.status(500).json({ error: 'Error al sugerir respuesta' })
  }
})

router.post('/risk-analysis', authenticate, async (req: Request, res: Response) => {
  try {
    const input = aiInputSchema.parse(req.body)
    const result = await analyzeRisk({ ...input, userId: req.user!.userId, role: req.user!.role })
    return res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    return res.status(500).json({ error: 'Error al analizar riesgo' })
  }
})

router.post('/next-action', authenticate, async (req: Request, res: Response) => {
  try {
    const input = aiInputSchema.parse(req.body)
    const result = await recommendNextAction({ ...input, userId: req.user!.userId, role: req.user!.role })
    return res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    return res.status(500).json({ error: 'Error al recomendar acción' })
  }
})

router.post('/approve', authenticate, async (req: Request, res: Response) => {
  try {
    const { aiLogId } = approveSchema.parse(req.body)
    await approveAiAction(aiLogId, req.user!.userId)
    return res.json({ message: 'Acción aprobada' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    return res.status(500).json({ error: 'Error al aprobar acción' })
  }
})

export default router
