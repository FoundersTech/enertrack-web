'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { scanAndConnect, isBleSupported, type EnerTrackBle } from '@/lib/ble'
import { registerDevice } from '@/hooks/use-devices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BluetoothIcon,
  WifiIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ArrowLeftIcon,
} from 'lucide-react'

type Step = 'intro' | 'scanning' | 'wifi_form' | 'provisioning' | 'success' | 'error'

const STEP_PROGRESS: Record<Step, number> = {
  intro: 0,
  scanning: 25,
  wifi_form: 55,
  provisioning: 80,
  success: 100,
  error: 0,
}

export default function OnboardingPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('intro')
  const [ble, setBle] = useState<EnerTrackBle | null>(null)
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [devName, setDevName] = useState('EnerTrack')
  const [statusMsg, setStatusMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const completedRef = useRef(false)
  const [deviceName, setDeviceName] = useState('')
  const [electricalConfig, setElectricalConfig] = useState('127v_monofasico')

  async function handleScan() {
    if (!isBleSupported()) {
      setErrorMsg('Seu navegador não suporta Web Bluetooth. Use Chrome ou Edge.')
      setStep('error')
      return
    }

    setStep('scanning')
    setErrorMsg('')

    try {
      const device = await scanAndConnect()

      setBle(device)
      setDevName(device.deviceName)
      setStep('wifi_form')

      device.onStatus((status) => {
        const normalizedStatus = status.trim().toLowerCase()

        setStatusMsg(normalizedStatus)

        if (normalizedStatus.includes('wifi_ok')) {
          void handleWifiSuccess(device)
          return
        }

        if (normalizedStatus.includes('wifi_fail')) {
          setErrorMsg('Não foi possível conectar ao Wi-Fi. Verifique o nome da rede e a senha.')
          setStep('wifi_form')
        }
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)

      if (msg.includes('User cancelled')) {
        setStep('intro')
        return
      }

      setErrorMsg(msg)
      setStep('error')
    }
  }

  async function handleSendWifi() {
    if (!ble || !ssid.trim()) return

    setStep('provisioning')
    setStatusMsg('Enviando credenciais...')
    setErrorMsg('')

    try {
      await ble.sendWifiCredentials(ssid.trim(), password)
    } catch {
      setErrorMsg('Falha ao enviar as credenciais via Bluetooth.')
      setStep('wifi_form')
    }
  }

  async function handleWifiSuccess(device: EnerTrackBle) {
    if (completedRef.current) return

    completedRef.current = true
    setStatusMsg('wifi_ok')
    setStep('success')

    try {
      await registerDevice({
        mac_address: device.macAddress,
        name: deviceName.trim() || device.deviceName,
        electrical_config: electricalConfig,
      })
    } catch {
      // O ESP32 já conectou ao Wi-Fi.
      // Não trava o usuário se o registro no D1 falhar.
    } finally {
      device.disconnect()
    }
  }

  const progress = STEP_PROGRESS[step]

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/dashboard">
          <ArrowLeftIcon data-icon="inline-start" />
          Dashboard
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Adicionar dispositivo</h1>
        <p className="text-sm text-muted-foreground">
          Conecte seu EnerTrack via Bluetooth e informe a rede Wi-Fi.
        </p>
      </div>

      <Progress value={progress} className="mb-6" />

      <Card>
        <CardContent className="pt-6">
          {step === 'intro' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
                <BluetoothIcon className="size-10 text-primary" />
              </div>

              <div>
                <CardTitle className="mb-2">Pronto para conectar?</CardTitle>
                <CardDescription>
                  Certifique-se de que seu EnerTrack está ligado e próximo.
                </CardDescription>
              </div>

              <Button onClick={handleScan} className="w-full">
                Buscar dispositivo
              </Button>

              <p className="text-xs text-muted-foreground">
                Requer Chrome ou Edge. iOS Safari não suporta Web Bluetooth.
              </p>
            </div>
          )}

          {step === 'scanning' && (
            <div className="flex flex-col items-center gap-6 py-4 text-center">
              <div className="relative">
                <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
                  <BluetoothIcon className="size-10 text-primary" />
                </div>
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              </div>

              <div>
                <p className="font-medium">Procurando dispositivos...</p>
                <p className="text-sm text-muted-foreground">
                  Selecione o dispositivo EnerTrack na janela do navegador.
                </p>
              </div>
            </div>
          )}

          {step === 'wifi_form' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <span className="mr-1.5 size-2 rounded-full bg-primary" />
                  BLE conectado
                </Badge>
                <span className="text-sm text-muted-foreground">{devName}</span>
              </div>

              <div>
                <CardTitle className="text-lg">Informe a rede Wi-Fi</CardTitle>
                <CardDescription className="mt-1">
                  Digite exatamente o nome da rede e a senha que o dispositivo deve usar.
                </CardDescription>
              </div>

              {errorMsg && (
                <Alert variant="destructive">
                  <AlertCircleIcon className="size-4" />
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel>Nome do dispositivo</FieldLabel>
                  <Input
                    placeholder="Ex: Sala, Quarto, Padrão principal"
                    value={deviceName}
                    onChange={(event) => setDeviceName(event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>Configuração elétrica</FieldLabel>
                  <select
                    value={electricalConfig}
                    onChange={(event) => setElectricalConfig(event.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="127v_monofasico">127V monofásico</option>
                    <option value="220v_monofasico">220V monofásico</option>
                    <option value="220v_trifasico">220V trifásico</option>
                    <option value="380v_trifasico">380V trifásico</option>
                  </select>
                </Field>
                <Field>
                  <FieldLabel>Nome da rede Wi-Fi (SSID)</FieldLabel>
                  <Input
                    placeholder="Ex: Minha Rede"
                    value={ssid}
                    onChange={(event) => setSsid(event.target.value)}
                    autoComplete="off"
                  />
                </Field>

                <Field>
                  <FieldLabel>Senha do Wi-Fi</FieldLabel>
                  <Input
                    type="password"
                    placeholder="Digite a senha da rede"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                  />
                </Field>
              </FieldGroup>

              <Button onClick={handleSendWifi} disabled={!ssid.trim()} className="w-full">
                Conectar dispositivo
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  completedRef.current = false
                  ble?.disconnect()
                  setBle(null)
                  setSsid('')
                  setPassword('')
                  setStatusMsg('')
                  setErrorMsg('')
                  setStep('intro')
                }}
                className="w-full"
              >
                Trocar dispositivo
              </Button>
            </div>
          )}

          {step === 'provisioning' && (
            <div className="flex flex-col items-center gap-6 py-4 text-center">
              <div className="relative">
                <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
                  <WifiIcon className="size-10 text-primary" />
                </div>
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              </div>

              <div>
                <p className="font-medium">Conectando ao Wi-Fi...</p>
                <p className="text-sm text-muted-foreground">
                  Tentando conectar à rede &quot;{ssid}&quot;.
                </p>

                {statusMsg && (
                  <Badge variant="secondary" className="mt-2">
                    {statusMsg}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2Icon className="size-10 text-primary" />
              </div>

              <div>
                <CardTitle className="mb-2">Tudo pronto!</CardTitle>
                <CardDescription>
                  {devName} foi configurado e registrado.
                </CardDescription>
              </div>

              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Ver dashboard
              </Button>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col gap-4">
              <Alert variant="destructive">
                <AlertCircleIcon className="size-4" />
                <AlertDescription>
                  {errorMsg || 'Ocorreu um erro inesperado.'}
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                onClick={() => {
                  completedRef.current = false
                  ble?.disconnect()
                  setBle(null)
                  setErrorMsg('')
                  setStep('intro')
                }}
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}