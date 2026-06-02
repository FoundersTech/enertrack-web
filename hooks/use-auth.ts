'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials extends LoginCredentials {
  name: string
}

interface AuthResponse {
  user?: {
    id: string
    name: string
    email: string
  }
  error?: string
}

export function useAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (credentials: LoginCredentials, redirectTo = '/dashboard') => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      const data: AuthResponse = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Falha no login')
        return false
      }

      router.push(redirectTo)
      return true
    } catch {
      setError('Erro de conexão. Tente novamente.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials, redirectTo = '/onboarding') => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      const data: AuthResponse = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Falha ao criar conta')
        return false
      }

      router.push(redirectTo)
      return true
    } catch {
      setError('Erro de conexão. Tente novamente.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    register,
    logout,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}
