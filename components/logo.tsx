'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  showTagline?: boolean
  className?: string
}

export function Logo({ size = 32, showTagline = false, className }: LogoProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="flex items-center gap-2.5">
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none"
          className="text-primary"
        >
          {/* Hexagon shape */}
          <path 
            d="M16 2L28 9V23L16 30L4 23V9L16 2Z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none"
          />
          {/* Lightning bolt */}
          <path 
            d="M18 8L12 16H16L14 24L22 14H17L18 8Z" 
            fill="currentColor"
          />
        </svg>
        <span 
          className="font-semibold tracking-tight"
          style={{ fontSize: size * 0.5 }}
        >
          EnerTrack
        </span>
      </div>
      {showTagline && (
        <p className="text-xs text-muted-foreground">
          Monitoramento inteligente de energia
        </p>
      )}
    </div>
  )
}
