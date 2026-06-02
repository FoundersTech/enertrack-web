'use client'

import useSWR from 'swr'

export interface CurrentUser {
  id: string
  name: string
  email: string
}

interface UserResponse {
  user: CurrentUser
}

const fetcher = async (url: string): Promise<UserResponse> => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('Falha ao carregar usuário') as Error & { status?: number }
    error.status = res.status
    throw error
  }
  return res.json()
}

export function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'U'
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<UserResponse>('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    user: data?.user ?? null,
    initials: getInitials(data?.user?.name, data?.user?.email),
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}
