import { Router } from 'express'
import authRoutes from './auth.routes'
import ticketsRoutes from './tickets.routes'
import commentsRoutes from './comments.routes'
import categoriesRoutes from './categories.routes'
import aiRoutes from './ai.routes'
import adminRoutes from './admin.routes'
import n8nWebhooks from './webhooks/n8n.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

router.use('/auth', authRoutes)
router.use('/tickets', ticketsRoutes)
router.use('/tickets/:ticketId/comments', commentsRoutes)
router.use('/categories', categoriesRoutes)
router.use('/ai', aiRoutes)
router.use('/admin', adminRoutes)
router.use('/webhooks', n8nWebhooks)

export default router
