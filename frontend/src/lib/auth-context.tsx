'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { api } from './api'

interface User {
  id: string
  email: string
  username: string
  name: string
  role: 'admin' | 'agent' | 'user'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    }
    return null
  })
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  })
  const isLoading = false

  function setTokenCookie(token: string) {
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
  }

  function clearTokenCookie() {
    document.cookie = 'token=; path=/; max-age=0'
  }

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<{ user: User; token: string }>('/auth/login', { email, password })
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setTokenCookie(data.token)
  }, [])

  const register = useCallback(async (email: string, username: string, password: string, name: string) => {
    const data = await api.post<{ user: User; token: string }>('/auth/register', { email, username, password, name })
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setTokenCookie(data.token)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    clearTokenCookie()
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
