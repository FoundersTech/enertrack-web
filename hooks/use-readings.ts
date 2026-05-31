'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface Reading {
  irms: number
  watts: number
  recorded_at: number | string
}

interface UseReadingsOptions {
  deviceId: string | null
  interval?: number // polling interval in ms
  limit?: number
}

export function useReadings({ deviceId, interval = 5000, limit = 60 }: UseReadingsOptions) {
  const [readings, setReadings] = useState<Reading[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchReadings = useCallback(async () => {
    if (!deviceId) return

    try {
      const res = await fetch(`/api/readings?device_id=${deviceId}&limit=${limit}`)
      if (!res.ok) throw new Error('Falha ao carregar leituras')
      
      const data = await res.json()
      setReadings(data.readings ?? [])
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [deviceId, limit])

  useEffect(() => {
    if (!deviceId) {
      setReadings([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    fetchReadings()

    pollRef.current = setInterval(fetchReadings, interval)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [deviceId, interval, fetchReadings])

  // Derived values
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null
  
  const avgWatts = readings.length > 0
    ? readings.reduce((sum, r) => sum + r.watts, 0) / readings.length
    : 0

  const maxWatts = readings.length > 0
    ? Math.max(...readings.map(r => r.watts))
    : 0

  // Estimativas diárias
  const estimatedDailyKwh = (avgWatts * 24) / 1000
  const estimatedDailyCost = estimatedDailyKwh * 0.85 // R$ 0,85/kWh (média Brasil)

  return {
    readings,
    latestReading,
    avgWatts,
    maxWatts,
    estimatedDailyKwh,
    estimatedDailyCost,
    isLoading,
    error,
    refetch: fetchReadings,
  }
}
