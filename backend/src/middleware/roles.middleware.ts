import { Request, Response, NextFunction } from 'express'
import { Role } from '../types'

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' })
    }

    next()
  }
}
