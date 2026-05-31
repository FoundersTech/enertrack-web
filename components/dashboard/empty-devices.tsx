import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { CpuIcon, PlusIcon } from 'lucide-react'

export function EmptyDevices() {
  return (
    <Empty className="my-12">
      <Empty.Icon>
        <CpuIcon className="size-10 text-muted-foreground/50" />
      </Empty.Icon>
      <Empty.Title>Nenhum dispositivo</Empty.Title>
      <Empty.Description>
        Adicione seu primeiro EnerTrack para começar a monitorar o consumo de energia.
      </Empty.Description>
      <Empty.Actions>
        <Button asChild>
          <Link href="/onboarding">
            <PlusIcon data-icon="inline-start" />
            Adicionar dispositivo
          </Link>
        </Button>
      </Empty.Actions>
    </Empty>
  )
}
