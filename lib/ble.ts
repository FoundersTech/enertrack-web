/// <reference types="@anthropic-ai/sdk/shims/web" />

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc'
const CHAR_SSID_UUID = '12345678-1234-1234-1234-123456789ab1'
const CHAR_PASS_UUID = '12345678-1234-1234-1234-123456789ab2'
const CHAR_STATUS_UUID = '12345678-1234-1234-1234-123456789ab3'
const CHAR_ENERGY_UUID = '12345678-1234-1234-1234-123456789ab4'

export interface EnerTrackBle {
  deviceName: string
  macAddress: string
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

  if (!device.gatt) {
    throw new Error('GATT não disponível.')
  }

  const server = await device.gatt.connect()
  const service = await server.getPrimaryService(SERVICE_UUID)

  const charSsid = await service.getCharacteristic(CHAR_SSID_UUID)
  const charPass = await service.getCharacteristic(CHAR_PASS_UUID)
  const charStatus = await service.getCharacteristic(CHAR_STATUS_UUID)
  const charEnergy = await service.getCharacteristic(CHAR_ENERGY_UUID)

  const macSuffix = device.name?.split('-')[1] ?? 'UNKNOWN'

  return {
    deviceName: device.name ?? 'EnerTrack',
    macAddress: macSuffix,

    async sendWifiCredentials(ssid, password) {
      await charSsid.writeValueWithResponse(strToBytes(ssid))
      await charPass.writeValueWithResponse(strToBytes(password))
    },

    onStatus(cb) {
      charStatus.startNotifications().catch(() => undefined)
      charStatus.addEventListener('characteristicvaluechanged', (event: Event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value
        if (!value) return

        cb(new TextDecoder().decode(value))
      })
    },

    onEnergy(cb) {
      charEnergy.startNotifications().catch(() => undefined)
      charEnergy.addEventListener('characteristicvaluechanged', (event: Event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value
        if (!value) return

        try {
          cb(JSON.parse(new TextDecoder().decode(value)))
        } catch {
          // Ignore invalid BLE payloads.
        }
      })
    },

    disconnect() {
      device.gatt?.disconnect()
    },
  }
}