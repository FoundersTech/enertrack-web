'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig 
} from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface Reading {
  irms: number
  watts: number
  recorded_at: number
}

interface EnergyChartProps {
  readings: Reading[]
  className?: string
}

const chartConfig = {
  watts: {
    label: 'Potência',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function EnergyChart({ readings, className }: EnergyChartProps) {
  const data = readings.map((r, index) => ({
    time: index,
    watts: r.watts,
    formattedTime: new Date(r.recorded_at).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }))

  if (readings.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Consumo em tempo real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Aguardando dados do dispositivo...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Consumo em tempo real
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillWatts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                width={40}
                tickFormatter={(value) => `${value}W`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${Number(value).toFixed(1)} W`, 'Potência']}
                    labelFormatter={(_, payload) => {
                      if (payload?.[0]?.payload?.formattedTime) {
                        return payload[0].payload.formattedTime
                      }
                      return ''
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="watts"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#fillWatts)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
