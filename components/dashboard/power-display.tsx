'use client'

import { cn } from '@/lib/utils'

interface PowerDisplayProps {
  watts: number | null
  amps?: number | null
  isLive?: boolean
  className?: string
}

export function PowerDisplay({ watts, amps, isLive = false, className }: PowerDisplayProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Potência atual
        </span>
        {isLive && (
          <span className="size-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span 
          className={cn(
            'font-mono text-5xl font-bold tracking-tighter',
            watts !== null ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {watts !== null ? watts.toFixed(1) : '---'}
        </span>
        <span className="font-mono text-xl text-muted-foreground">W</span>
      </div>
      {amps !== null && amps !== undefined && (
        <p className="font-mono text-sm text-muted-foreground">
          {amps.toFixed(2)} A
        </p>
      )}
    </div>
  )
}
