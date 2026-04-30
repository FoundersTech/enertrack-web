'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { scanAndConnect, isBleSupported, type EnerTrackBle, type WifiNetwork } from '@/lib/ble'

type Step = 'intro' | 'scanning' | 'connected' | 'wifi_scan' | 'wifi_form' | 'provisioning' | 'success' | 'error'

const STEP_INDEX: Record<Step, number> = {
  intro: 0, scanning: 1, connected: 2, wifi_scan: 3, wifi_form: 3, provisioning: 4, success: 5, error: 5,
}

export default function OnboardingPage() {
  const router = useRouter()

  const [step,      setStep]      = useState<Step>('intro')
  const [ble,       setBle]       = useState<EnerTrackBle | null>(null)
  const [networks,  setNetworks]  = useState<WifiNetwork[]>([])
  const [scanning,  setScanning]  = useState(false)
  const [ssid,      setSsid]      = useState('')
  const [password,  setPassword]  = useState('')
  const [devName,   setDevName]   = useState('EnerTrack')
  const [statusMsg, setStatusMsg] = useState('')
  const [errorMsg,  setErrorMsg]  = useState('')

  // Passo 1: conecta via BLE
  async function handleScan() {
    if (!isBleSupported()) {
      setErrorMsg('Seu browser não suporta Web Bluetooth. Use Chrome ou Edge.')
      setStep('error')
      return
    }
    setStep('scanning')
    setErrorMsg('')
    try {
      const device = await scanAndConnect()
      setBle(device)
      setDevName(device.deviceName)

      device.onStatus(status => {
        setStatusMsg(status)
        if (status === 'wifi_ok')   { handleWifiSuccess(device) }
        if (status === 'wifi_fail') {
          setErrorMsg('Não foi possível conectar ao Wi-Fi. Verifique a senha.')
          setStep('wifi_form')
        }
      })

      // Recebe chunks de redes do scan
      device.onWifiNetworks((nets, more) => {
        setNetworks(prev => {
          // Evita duplicatas por SSID
          const existing = new Set(prev.map(n => n.ssid))
          const news = nets.filter(n => !existing.has(n.ssid))
          return [...prev, ...news]
        })
        if (!more) setScanning(false)
      })

      setStep('connected')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('User cancelled')) {
        setStep('intro')
      } else {
        setErrorMsg(msg)
        setStep('error')
      }
    }
  }

  // Passo 2: solicita scan de redes ao ESP32
  async function handleRequestScan() {
    if (!ble) return
    setNetworks([])
    setScanning(true)
    setStep('wifi_scan')
    try {
      await ble.requestWifiScan()
    } catch {
      setScanning(false)
      setErrorMsg('Falha ao solicitar scan de redes.')
      setStep('wifi_form')
    }
  }

  // Passo 3: usuário selecionou uma rede
  function handleSelectNetwork(network: WifiNetwork) {
    setSsid(network.ssid)
    setPassword('')
    setStep('wifi_form')
  }

  // Passo 4: envia credenciais ao ESP32
  async function handleSendWifi() {
    if (!ble || !ssid) return
    setStep('provisioning')
    setStatusMsg('connecting')
    setErrorMsg('')
    try {
      await ble.sendWifiCredentials(ssid, password)
    } catch {
      setErrorMsg('Falha ao enviar credenciais via Bluetooth.')
      setStep('wifi_form')
    }
  }

  // Passo 5: registra device no backend
  async function handleWifiSuccess(device: EnerTrackBle) {
    try {
      const res  = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac_address: device.macAddress, name: device.deviceName }),
      })
      const data = await res.json() as { device?: { id: string } }
      void data
      device.disconnect()
    } catch {}
    setStep('success')
  }

  const currentIdx = STEP_INDEX[step]

  return (
    <main className="page-center">
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ marginBottom: 32 }}>
          <button onClick={() => router.push('/dashboard')} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center',
            gap: 6, marginBottom: 24
          }}>
            ← Dashboard
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Adicionar dispositivo
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            Conecte seu EnerTrack via Bluetooth
          </p>
        </div>

        {/* Step dots */}
        <div className="steps" style={{ marginBottom: 28 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} className={`step-dot ${i === currentIdx ? 'active' : i < currentIdx ? 'done' : ''}`}/>
          ))}
        </div>

        <div className="card animate-in" key={step}>

          {/* ── Intro ── */}
          {step === 'intro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <BleIcon size={64} />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Pronto para conectar?</h2>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
                  Certifique-se que seu EnerTrack está ligado e próximo.
                </p>
              </div>
              <button className="btn btn-primary btn-full" onClick={handleScan}>
                Buscar dispositivo
              </button>
            </div>
          )}

          {/* ── Scanning BLE ── */}
          {step === 'scanning' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '20px 0' }}>
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <div className="pulse-ring" style={{ animationDelay: '0s' }} />
                <div className="pulse-ring" style={{ animationDelay: '0.6s' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: 'var(--bg-3)', borderRadius: '50%' }}>
                  <BleIcon size={32} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600 }}>Procurando dispositivos...</p>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
                  Selecione "EnerTrack-XXXX" na janela do browser
                </p>
              </div>
            </div>
          )}

          {/* ── Conectado — escolher ação ── */}
          {step === 'connected' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(0,212,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BleIcon size={22} color="var(--accent)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>{devName}</p>
                  <span className="badge badge-ok">Conectado via BLE</span>
                </div>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                Dispositivo encontrado! Vamos buscar as redes Wi-Fi disponíveis.
              </p>
              <button className="btn btn-primary btn-full" onClick={handleRequestScan}>
                Buscar redes Wi-Fi →
              </button>
            </div>
          )}

          {/* ── Scan de redes Wi-Fi ── */}
          {step === 'wifi_scan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h2 style={{ fontSize: 17, fontWeight: 600 }}>Redes disponíveis</h2>
                {scanning && <span style={{ fontSize: 12, color: 'var(--accent)' }}>Buscando...</span>}
              </div>

              {networks.length === 0 && scanning && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 14 }}>
                  Aguardando lista de redes...
                </div>
              )}

              {networks.map((net, i) => (
                <button key={i} onClick={() => handleSelectNetwork(net)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg-3)', cursor: 'pointer', width: '100%',
                  color: 'var(--text)', transition: 'border-color 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <WifiSignalIcon rssi={net.rssi} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{net.ssid}</p>
                      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {net.secure ? '🔒 Protegida' : '🔓 Aberta'} · {net.rssi} dBm
                      </p>
                    </div>
                  </div>
                  <span style={{ color: 'var(--accent)', fontSize: 18 }}>›</span>
                </button>
              ))}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-outline btn-full" onClick={handleRequestScan} disabled={scanning}>
                  {scanning ? 'Buscando...' : '↻ Buscar novamente'}
                </button>
                <button className="btn btn-outline" onClick={() => setStep('wifi_form')}
                  style={{ whiteSpace: 'nowrap' }}>
                  Digitar manualmente
                </button>
              </div>
            </div>
          )}

          {/* ── Formulário de senha ── */}
          {step === 'wifi_form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="badge badge-ok">BLE conectado</span>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>→ {devName}</span>
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 600 }}>
                {ssid ? `Conectar à "${ssid}"` : 'Configure o Wi-Fi'}
              </h2>

              {errorMsg && <p className="error-msg">{errorMsg}</p>}

              {!ssid && (
                <div className="field">
                  <label>Nome da rede (SSID)</label>
                  <input type="text" placeholder="Minha Rede" value={ssid}
                    onChange={e => setSsid(e.target.value)} autoComplete="off"/>
                </div>
              )}

              {ssid && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 8,
                  border: '1px solid var(--border)' }}>
                  <WifiSignalIcon rssi={networks.find(n => n.ssid === ssid)?.rssi ?? -60} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{ssid}</span>
                  <button onClick={() => { setSsid(''); setStep('wifi_scan') }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none',
                    color: 'var(--muted)', cursor: 'pointer', fontSize: 12 }}>
                    Trocar
                  </button>
                </div>
              )}

              <div className="field">
                <label>Senha do Wi-Fi</label>
                <input type="password" placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} autoComplete="off"/>
              </div>

              <button className="btn btn-primary btn-full" onClick={handleSendWifi}
                disabled={!ssid} style={{ marginTop: 4 }}>
                Conectar dispositivo
              </button>
            </div>
          )}

          {/* ── Provisionando ── */}
          {step === 'provisioning' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '20px 0' }}>
              <WifiConnectingIcon />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600 }}>Conectando ao Wi-Fi...</p>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
                  Conectando à rede "{ssid}"
                </p>
                {statusMsg && (
                  <span className="badge badge-info" style={{ marginTop: 10 }}>{statusMsg}</span>
                )}
              </div>
            </div>
          )}

          {/* ── Sucesso ── */}
          {step === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '16px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(0,212,160,0.12)', border: '1px solid rgba(0,212,160,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14l6 6L22 8" stroke="var(--accent)" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: 18 }}>Tudo pronto!</p>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
                  {devName} está online e enviando leituras.
                </p>
              </div>
              <button className="btn btn-primary btn-full" onClick={() => router.push('/dashboard')}>
                Ver dashboard
              </button>
            </div>
          )}

          {/* ── Erro ── */}
          {step === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p className="error-msg">{errorMsg || 'Ocorreu um erro inesperado.'}</p>
              <button className="btn btn-outline btn-full"
                onClick={() => { setStep('intro'); setBle(null) }}>
                Tentar novamente
              </button>
            </div>
          )}

        </div>

        {step === 'intro' && (
          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
            Requer Chrome ou Edge — iOS Safari não suporta Web Bluetooth
          </p>
        )}
      </div>
    </main>
  )
}

// ─── Ícones ───────────────────────────────────────────────────────────────────
function BleIcon({ size = 24, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" strokeLinecap="round"/>
      <path d="M12 3v18M12 3l5 5-5 5M12 21l5-5-5-5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function WifiSignalIcon({ rssi }: { rssi: number }) {
  // Converte RSSI em força (0-3 barras)
  const strength = rssi >= -50 ? 3 : rssi >= -70 ? 2 : rssi >= -85 ? 1 : 0
  const color = strength >= 2 ? 'var(--accent)' : strength === 1 ? 'var(--warn)' : 'var(--muted)'
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      {strength >= 1 && <path d="M8.5 15.5a7 7 0 0 1 7 0" strokeLinecap="round"/>}
      {strength >= 2 && <path d="M5 12a12 12 0 0 1 14 0" strokeLinecap="round"/>}
      {strength >= 3 && <path d="M1.5 8.5A16 16 0 0 1 22.5 8.5" strokeLinecap="round"/>}
      <circle cx="12" cy="19" r="1" fill={color} stroke="none"/>
    </svg>
  )
}

function WifiConnectingIcon() {
  return (
    <div style={{ position: 'relative', width: 64, height: 64 }}>
      <div className="pulse-ring" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-3)', borderRadius: '50%' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="var(--accent-2)" strokeWidth="1.5">
          <path d="M1.5 8.5A16 16 0 0 1 22.5 8.5" strokeLinecap="round"/>
          <path d="M5 12a12 12 0 0 1 14 0" strokeLinecap="round"/>
          <path d="M8.5 15.5a7 7 0 0 1 7 0" strokeLinecap="round"/>
          <circle cx="12" cy="19" r="1" fill="var(--accent-2)"/>
        </svg>
      </div>
    </div>
  )
}