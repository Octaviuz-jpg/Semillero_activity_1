import { Router } from 'express'
import authRoutes from './auth.routes'
import ticketsRoutes from './tickets.routes'
import commentsRoutes from './comments.routes'
import categoriesRoutes from './categories.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

router.use('/auth', authRoutes)
router.use('/tickets', ticketsRoutes)
router.use('/tickets/:ticketId/comments', commentsRoutes)
router.use('/categories', categoriesRoutes)

export default router
