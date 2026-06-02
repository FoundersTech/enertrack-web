'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CpuIcon, MapPinIcon } from 'lucide-react'

interface Device {
  id: string
  name: string
  mac_address: string
  location: string | null
  registered_at: number
}

interface DeviceSelectorProps {
  devices: Device[]
  activeDevice: Device | null
  onSelect: (device: Device) => void
  className?: string
}

export function DeviceSelector({ 
  devices, 
  activeDevice, 
  onSelect,
  className 
}: DeviceSelectorProps) {
  if (devices.length <= 1) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {devices.map((device) => {
        const isActive = activeDevice?.id === device.id

        return (
          <Button
            key={device.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(device)}
            className={cn(
              'h-auto gap-2 px-3 py-2',
              isActive && 'bg-primary text-primary-foreground'
            )}
          >
            <CpuIcon className="size-4" />
            <span className="font-medium">{device.name}</span>
            {device.location && (
              <>
                <span className="text-muted-foreground">|</span>
                <span className="flex items-center gap-1 text-xs opacity-70">
                  <MapPinIcon className="size-3" />
                  {device.location}
                </span>
              </>
            )}
          </Button>
        )
      })}
    </div>
  )
}

interface LiveIndicatorProps {
  isLive: boolean
  className?: string
}

export function LiveIndicator({ isLive, className }: LiveIndicatorProps) {
  return (
    <Badge 
      variant={isLive ? 'default' : 'secondary'}
      className={cn(
        'gap-1.5',
        isLive && 'bg-primary/10 text-primary hover:bg-primary/20',
        className
      )}
    >
      <span 
        className={cn(
          'size-2 rounded-full',
          isLive ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
        )} 
      />
      {isLive ? 'Ao vivo' : 'Offline'}
    </Badge>
  )
}
