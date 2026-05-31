import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ZapIcon, 
  WifiIcon, 
  BarChart3Icon, 
  SmartphoneIcon,
  ArrowRightIcon 
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between px-4 py-4">
        <Logo size={28} />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Criar conta</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <ZapIcon className="size-4" />
          Monitoramento IoT
        </div>
        
        <h1 className="mb-4 max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Monitore seu consumo de energia{' '}
          <span className="text-primary">em tempo real</span>
        </h1>
        
        <p className="mb-8 max-w-xl text-pretty text-muted-foreground sm:text-lg">
          Conecte seu dispositivo EnerTrack e tenha controle total sobre seu consumo
          de energia. Economize dinheiro e energia com dados precisos.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">
              Começar agora
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/login">Já tenho conta</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-20 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          <Card className="text-left">
            <CardContent className="pt-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <WifiIcon className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Conexão Bluetooth</h3>
              <p className="text-sm text-muted-foreground">
                Configure seu EnerTrack facilmente via Web Bluetooth direto do navegador.
              </p>
            </CardContent>
          </Card>

          <Card className="text-left">
            <CardContent className="pt-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3Icon className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Dados em tempo real</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe o consumo de energia com atualizações a cada 5 segundos.
              </p>
            </CardContent>
          </Card>

          <Card className="text-left">
            <CardContent className="pt-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <SmartphoneIcon className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Acesse de qualquer lugar</h3>
              <p className="text-sm text-muted-foreground">
                Dashboard responsivo para acessar seus dados em qualquer dispositivo.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <p>EnerTrack - Monitoramento inteligente de energia</p>
          <p>~by TechFounders</p>
        </div>
      </footer>
    </div>
  )
}
