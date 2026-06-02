import { NextRequest, NextResponse } from 'next/server'
import { getEnv } from '@/lib/db'

type DeviceFirmwareRow = {
  id: string
  mac_address: string
  firmware_version: string | null
  target_firmware_version: string | null
  firmware_update_requested: number
  firmware_update_status: string | null
}

type FirmwareVersionRow = {
  version: string
  binary_url: string
}

function normalizeMac(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function GET(req: NextRequest) {
  const env = await getEnv(req)
  const { searchParams } = new URL(req.url)

  const rawMac =
    searchParams.get('mac_address') ??
    searchParams.get('mac') ??
    req.headers.get('x-device-mac')

  const currentVersion =
    searchParams.get('version') ??
    req.headers.get('x-device-version')

  if (!rawMac) {
    return NextResponse.json(
      { update: false, error: 'mac_address obrigatório' },
      { status: 400 },
    )
  }

  const macAddress = normalizeMac(rawMac)

  const device = await env.DB
    .prepare(
      `
      SELECT
        id,
        mac_address,
        firmware_version,
        target_firmware_version,
        firmware_update_requested,
        firmware_update_status
      FROM devices
      WHERE active = 1
        AND REPLACE(REPLACE(REPLACE(UPPER(mac_address), ':', ''), '-', ''), ' ', '') = ?
      LIMIT 1
      `,
    )
    .bind(macAddress)
    .first<DeviceFirmwareRow>()

  if (!device) {
    return NextResponse.json(
      {
        update: false,
        error: 'Device não registrado',
        mac_address: macAddress,
      },
      { status: 404 },
    )
  }

  await env.DB
    .prepare(
      `
      UPDATE devices
      SET
        last_seen_at = strftime('%s','now'),
        firmware_version = COALESCE(?, firmware_version)
      WHERE id = ?
      `,
    )
    .bind(currentVersion, device.id)
    .run()

  if (!device.firmware_update_requested || !device.target_firmware_version) {
    return NextResponse.json({
      update: false,
      version: currentVersion ?? device.firmware_version,
      status: device.firmware_update_status ?? 'idle',
    })
  }

  const firmware = await env.DB
    .prepare(
      `
      SELECT version, binary_url
      FROM firmware_versions
      WHERE active = 1
        AND version = ?
      LIMIT 1
      `,
    )
    .bind(device.target_firmware_version)
    .first<FirmwareVersionRow>()

  if (!firmware) {
    return NextResponse.json(
      {
        update: false,
        error: 'Firmware alvo não encontrado',
        target_firmware_version: device.target_firmware_version,
      },
      { status: 404 },
    )
  }

  if (currentVersion && currentVersion.trim() === firmware.version) {
    await env.DB
      .prepare(
        `
        UPDATE devices
        SET
          firmware_version = ?,
          target_firmware_version = NULL,
          firmware_update_requested = 0,
          firmware_update_status = 'success',
          firmware_updated_at = strftime('%s','now')
        WHERE id = ?
        `,
      )
      .bind(firmware.version, device.id)
      .run()

    return NextResponse.json({
      update: false,
      version: firmware.version,
      status: 'success',
    })
  }

  await env.DB
    .prepare(
      `
      UPDATE devices
      SET firmware_update_status = 'available'
      WHERE id = ?
      `,
    )
    .bind(device.id)
    .run()

  return NextResponse.json({
    update: true,
    version: firmware.version,
    current_version: currentVersion ?? device.firmware_version,
    url: firmware.binary_url,
    status: 'available',
  })
}