/// <reference types="web-bluetooth" />

const SERVICE_UUID = '260068aa-c6db-4917-99ca-badb5c51f3fc'
const CHAR_SSID_UUID = 'ac3bfe5c-27e6-4b39-8d94-2fd85a9a02d6'
const CHAR_PASS_UUID = '36c71103-c480-4b2c-8fe8-8ca45a22766b'
const CHAR_STATUS_UUID = 'd92bd0e1-0951-45e1-9736-50446ddb3946'
const CHAR_ENERGY_UUID = '6d18dfb9-2356-46fd-af05-173d252b830d'
const CHAR_CONFIG_UUID = '50a18a52-a309-4710-9600-a139e45b03ce'

export interface EnerTrackBle {
  deviceName: string
  macAddress: string
  sendDeviceConfig(alias: string, netType: string, voltage: number): Promise<void>
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
  const charConfig = await service.getCharacteristic(CHAR_CONFIG_UUID)

  const macAddress = device.name?.split('-')[1] ?? 'UNKNOWN'

  return {
    deviceName: device.name ?? 'EnerTrack',
    macAddress,

    async sendDeviceConfig(alias, netType, voltage) {
      const payload = JSON.stringify({
        alias,
        netType,
        net_type: netType,
        voltage,
      })

      await charConfig.writeValueWithResponse(strToBytes(payload))
    },

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