import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'
import { JwtPayload, User } from '../types'

function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export async function registerUser(email: string, username: string, password: string, name: string) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${email},username.eq.${username}`)
    .single()

  if (existing) {
    throw new Error('El email o username ya está registrado')
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data, error } = await supabase
    .from('users')
    .insert({ email, username, password_hash, name, role: 'user' })
    .select()
    .single()

  if (error || !data) {
    throw new Error('Error al registrar usuario')
  }

  const user = data as User
  const token = generateToken({ userId: user.id, email: user.email, role: user.role })

  return {
    user: { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role },
    token,
  }
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) {
    throw new Error('Credenciales inválidas')
  }

  const user = data as User
  const valid = await bcrypt.compare(password, user.password_hash)

  if (!valid) {
    throw new Error('Credenciales inválidas')
  }

  const token = generateToken({ userId: user.id, email: user.email, role: user.role })

  return {
    user: { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role },
    token,
  }
}
