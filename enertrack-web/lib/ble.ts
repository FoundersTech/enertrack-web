/// <reference types="@types/web-bluetooth" />

const SERVICE_UUID         = '12345678-1234-1234-1234-123456789abc'
const CHAR_SSID_UUID       = '12345678-1234-1234-1234-123456789ab1'
const CHAR_PASS_UUID       = '12345678-1234-1234-1234-123456789ab2'
const CHAR_STATUS_UUID     = '12345678-1234-1234-1234-123456789ab3'
const CHAR_ENERGY_UUID     = '12345678-1234-1234-1234-123456789ab4'
const CHAR_WIFI_SCAN_UUID  = '12345678-1234-1234-1234-123456789ab5'

export interface WifiNetwork {
  ssid:   string
  rssi:   number
  secure: boolean
}

export interface EnerTrackBle {
  deviceName: string
  macAddress: string
  requestWifiScan(): Promise<void>
  onWifiNetworks(cb: (networks: WifiNetwork[], more: boolean) => void): void
  sendWifiCredentials(ssid: string, password: string): Promise<void>
  onStatus(cb: (status: string) => void): void
  onEnergy(cb: (data: { irms: number; watts: number }) => void): void
  disconnect(): void
}

export function isBleSupported(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

function strToBytes(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer
}

export async function scanAndConnect(): Promise<EnerTrackBle> {
  if (!isBleSupported()) {
    throw new Error('Web Bluetooth não suportado. Use Chrome ou Edge.')
  }

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'EnerTrack' }],
    optionalServices: [SERVICE_UUID],
  })

  if (!device.gatt) throw new Error('GATT não disponível')

  const server  = await device.gatt.connect()
  const service = await server.getPrimaryService(SERVICE_UUID)

  const charSsid      = await service.getCharacteristic(CHAR_SSID_UUID)
  const charPass      = await service.getCharacteristic(CHAR_PASS_UUID)
  const charStatus    = await service.getCharacteristic(CHAR_STATUS_UUID)
  const charEnergy    = await service.getCharacteristic(CHAR_ENERGY_UUID)
  const charWifiScan  = await service.getCharacteristic(CHAR_WIFI_SCAN_UUID)

  const macSuffix = device.name?.split('-')[1] ?? 'UNKNOWN'

  return {
    deviceName: device.name ?? 'EnerTrack',
    macAddress: macSuffix,

    // Solicita ao ESP32 que faça scan de redes Wi-Fi
    async requestWifiScan() {
      await charWifiScan.writeValueWithResponse(strToBytes('scan'))
    },

    // Recebe chunks de redes via notify
    onWifiNetworks(cb) {
      charWifiScan.startNotifications()
      charWifiScan.addEventListener('characteristicvaluechanged', (e: Event) => {
        const val = (e.target as BluetoothRemoteGATTCharacteristic).value
        if (!val) return
        try {
          const json = JSON.parse(new TextDecoder().decode(val)) as {
            networks: WifiNetwork[]
            more: boolean
            total: number
          }
          cb(json.networks ?? [], json.more ?? false)
        } catch {}
      })
    },

    async sendWifiCredentials(ssid, password) {
      await charSsid.writeValueWithResponse(strToBytes(ssid))
      await charPass.writeValueWithResponse(strToBytes(password))
    },

    onStatus(cb) {
      charStatus.startNotifications()
      charStatus.addEventListener('characteristicvaluechanged', (e: Event) => {
        const val = (e.target as BluetoothRemoteGATTCharacteristic).value
        if (!val) return
        cb(new TextDecoder().decode(val))
      })
    },

    onEnergy(cb) {
      charEnergy.startNotifications()
      charEnergy.addEventListener('characteristicvaluechanged', (e: Event) => {
        const val = (e.target as BluetoothRemoteGATTCharacteristic).value
        if (!val) return
        try { cb(JSON.parse(new TextDecoder().decode(val))) } catch {}
      })
    },

    disconnect() { device.gatt?.disconnect() },
  }
}