'use client'

import useSWR from 'swr'

export interface Device {
  id: string
  name: string
  mac_address: string
  location: string | null
  electrical_config: string
  registered_at: number | string
}

interface DevicesResponse {
  devices: Device[]
}

const fetcher = async (url: string): Promise<DevicesResponse> => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('Falha ao carregar dispositivos') as Error & { status?: number }
    error.status = res.status
    throw error
  }
  return res.json()
}

export function useDevices() {
  const { data, error, isLoading, mutate } = useSWR<DevicesResponse>(
    '/api/devices',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    devices: data?.devices ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

interface RegisterDevicePayload {
  mac_address: string
  name?: string
  location?: string
  electrical_config?: string
}

export async function registerDevice(payload: RegisterDevicePayload) {
  const res = await fetch('/api/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? 'Falha ao registrar dispositivo')
  }

  return res.json()
}
