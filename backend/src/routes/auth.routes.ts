import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { registerUser, loginUser } from '../services/auth.service'

const router = Router()

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Username debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
  name: z.string().min(1, 'Nombre es requerido'),
})

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password es requerido'),
})

router.post('/register', async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body)
    const result = await registerUser(data.email, data.username, data.password, data.name)
    return res.status(201).json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(400).json({ error: message })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body)
    const result = await loginUser(data.email, data.password)
    return res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors })
    }
    const message = error instanceof Error ? error.message : 'Error interno'
    return res.status(401).json({ error: message })
  }
})

export default router
