export interface EnergyReadingLike {
  irms: number
  watts: number
  recorded_at: number | string
}

export function formatWatts(value?: number | null, digits = 1) {
  return `${Number(value ?? 0).toFixed(digits)} W`
}

export function formatAmps(value?: number | null, digits = 2) {
  return `${Number(value ?? 0).toFixed(digits)} A`
}

export function formatKwh(value?: number | null, digits = 2) {
  return `${Number(value ?? 0).toFixed(digits)} kWh`
}

export function formatCurrency(value?: number | null) {
  return Number(value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

export function parseRecordedAt(value: number | string) {
  if (typeof value === 'number') {
    return new Date(value < 10_000_000_000 ? value * 1000 : value)
  }

  return new Date(value)
}

export function formatReadingDate(value: number | string) {
  const date = parseRecordedAt(value)

  if (Number.isNaN(date.getTime())) {
    return 'Data inválida'
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatReadingTime(value: number | string) {
  const date = parseRecordedAt(value)

  if (Number.isNaN(date.getTime())) {
    return '--:--'
  }

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function getDailyKwh(avgWatts: number) {
  return (avgWatts * 24) / 1000
}

export function getDailyCost(kwh: number, tariff = 0.85) {
  return kwh * tariff
}

export function buildChartData(readings: EnergyReadingLike[]) {
  return readings.map((reading) => ({
    time: formatReadingTime(reading.recorded_at),
    value: Number(reading.watts ?? 0),
    power: Number(reading.watts ?? 0),
    current: Number(reading.irms ?? 0),
  }))
}

export function buildWeeklyData(readings: EnergyReadingLike[]) {
  const now = new Date()
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (6 - index))
    date.setHours(0, 0, 0, 0)

    return {
      date,
      day: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      value: 0,
    }
  })

  for (const reading of readings) {
    const date = parseRecordedAt(reading.recorded_at)
    if (Number.isNaN(date.getTime())) continue

    const index = days.findIndex((item) => item.date.toDateString() === date.toDateString())
    if (index >= 0) {
      days[index].value += Number(reading.watts ?? 0) / 1000 / 60
    }
  }

  return days.map((item) => ({ ...item, value: Number(item.value.toFixed(3)) }))
}
