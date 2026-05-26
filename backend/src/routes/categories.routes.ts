import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.middleware'
import { authorize } from '../middleware/roles.middleware'
import { getCategories, createCategory, updateCategory } from '../services/categories.service'

const router = Router()

const createSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  slug: z.string().min(1, 'Slug es requerido'),
  description: z.string().optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})

router.get('/', authenticate, async (_req: Request, res: Response) => {
  try {
    const categories = await getCategories()
    return res.json(categories)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(500).json({ error: message })
  }
})

router.post('/', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const data = createSchema.parse(req.body)
    const category = await createCategory(data.name, data.slug, data.description)
    return res.status(201).json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(500).json({ error: message })
  }
})

router.patch('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const data = updateSchema.parse(req.body)
    const category = await updateCategory(req.params.id, data)
    return res.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(500).json({ error: message })
  }
})

export default router
