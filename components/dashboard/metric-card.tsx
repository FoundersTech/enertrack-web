import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'primary' | 'warning'
  className?: string
}

export function MetricCard({ 
  label, 
  value, 
  unit, 
  trend,
  trendValue,
  variant = 'default',
  className 
}: MetricCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span 
            className={cn(
              'font-mono text-2xl font-bold tracking-tight',
              variant === 'primary' && 'text-primary',
              variant === 'warning' && 'text-warning',
              variant === 'default' && 'text-foreground'
            )}
          >
            {value}
          </span>
          {unit && (
            <span className="font-mono text-sm text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {trend && trendValue && (
          <div className={cn(
            'mt-2 flex items-center gap-1 text-xs',
            trend === 'up' && 'text-destructive',
            trend === 'down' && 'text-primary',
            trend === 'neutral' && 'text-muted-foreground'
          )}>
            {trend === 'up' && <TrendingUpIcon className="size-3" />}
            {trend === 'down' && <TrendingDownIcon className="size-3" />}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      )}
    </Card>
  )
}
