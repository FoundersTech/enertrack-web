import { NextRequest, NextResponse } from 'next/server'
import { TOKEN_COOKIE, verifyToken } from '@/lib/auth'
import { getEnv } from '@/lib/db'

type ReadingPayload = {
  mac_address?: unknown
  macAddress?: unknown
  mac?: unknown
  device_mac?: unknown
  irms?: unknown
  watts?: unknown
  current?: unknown
  power?: unknown
}

type DeviceRow = {
  id: string
  mac_address: string
}

function normalizeMac(value: string): string {
  return value.trim().toUpperCase()
}

function compactMac(value: string): string {
  return normalizeMac(value).replace(/[^A-Z0-9]/g, '')
}

function getMacSuffix(value: string): string {
  return compactMac(value).slice(-4)
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'))
    if (Number.isFinite(parsed)) return parsed
  }

  return null
}

function parsePayload(body: ReadingPayload) {
  const macAddress =
    readString(body.mac_address) ??
    readString(body.macAddress) ??
    readString(body.mac) ??
    readString(body.device_mac)

  const irms = readNumber(body.irms) ?? readNumber(body.current)
  const watts = readNumber(body.watts) ?? readNumber(body.power)

  if (!macAddress || macAddress.length < 4) {
    return { ok: false as const, error: 'mac_address obrigatório' }
  }

  if (irms === null || irms < 0) {
    return { ok: false as const, error: 'irms inválido' }
  }

  if (watts === null || watts < 0) {
    return { ok: false as const, error: 'watts inválido' }
  }

  return {
    ok: true as const,
    data: {
      macAddress: normalizeMac(macAddress),
      macCompact: compactMac(macAddress),
      macSuffix: getMacSuffix(macAddress),
      irms,
      watts,
    },
  }
}

async function findDeviceByMac(env: Awaited<ReturnType<typeof getEnv>>, macAddress: string) {
  const macCompact = compactMac(macAddress)
  const macSuffix = getMacSuffix(macAddress)

  const exact = await env.DB
    .prepare(
      `
      SELECT id, mac_address
      FROM devices
      WHERE active = 1
        AND UPPER(mac_address) = ?
      LIMIT 1
      `,
    )
    .bind(macAddress)
    .first<DeviceRow>()

  if (exact) return exact

  const compact = await env.DB
    .prepare(
      `
      SELECT id, mac_address
      FROM devices
      WHERE active = 1
        AND REPLACE(REPLACE(REPLACE(UPPER(mac_address), ':', ''), '-', ''), ' ', '') = ?
      LIMIT 1
      `,
    )
    .bind(macCompact)
    .first<DeviceRow>()

  if (compact) return compact

  const suffix = await env.DB
    .prepare(
      `
      SELECT id, mac_address
      FROM devices
      WHERE active = 1
        AND (
          UPPER(mac_address) = ?
          OR REPLACE(REPLACE(REPLACE(UPPER(mac_address), ':', ''), '-', ''), ' ', '') = ?
          OR REPLACE(REPLACE(REPLACE(UPPER(mac_address), ':', ''), '-', ''), ' ', '') LIKE ?
        )
      LIMIT 1
      `,
    )
    .bind(macSuffix, macSuffix, `%${macSuffix}`)
    .first<DeviceRow>()

  return suffix
}

export async function POST(req: NextRequest) {
  const env = await getEnv(req)

  try {
    const body = (await req.json()) as ReadingPayload
    const parsed = parsePayload(body)

    if (!parsed.ok) {
      return NextResponse.json(
        {
          error: parsed.error,
          received: body,
        },
        { status: 400 },
      )
    }

    const device = await findDeviceByMac(env, parsed.data.macAddress)

    if (!device) {
      return NextResponse.json(
        {
          error: 'Device não registrado',
          received_mac_address: parsed.data.macAddress,
          received_mac_compact: parsed.data.macCompact,
          received_mac_suffix: parsed.data.macSuffix,
        },
        { status: 404 },
      )
    }

    if (compactMac(device.mac_address) !== parsed.data.macCompact) {
      await env.DB
        .prepare('UPDATE devices SET mac_address = ? WHERE id = ?')
        .bind(parsed.data.macAddress, device.id)
        .run()
    }

    await env.DB
      .prepare(
        `
        INSERT INTO energy_readings (device_id, irms, watts)
        VALUES (?, ?, ?)
        `,
      )
      .bind(device.id, parsed.data.irms, parsed.data.watts)
      .run()

    return NextResponse.json({
      ok: true,
      device_id: device.id,
      mac_address: parsed.data.macAddress,
    })
  } catch (err) {
    console.error('[readings/ingest]', err)

    return NextResponse.json(
      {
        error: 'Erro interno',
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  const env = await getEnv(req)

  const token = req.cookies.get(TOKEN_COOKIE)?.value
  const user = token ? await verifyToken(token, env) : null

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const deviceId = searchParams.get('device_id')
  const limit = Math.min(Number(searchParams.get('limit') ?? 60), 500)

  if (!deviceId) {
    return NextResponse.json({ error: 'device_id obrigatório' }, { status: 400 })
  }

  const device = await env.DB
    .prepare(
      `
      SELECT id
      FROM devices
      WHERE id = ?
        AND user_id = ?
        AND active = 1
      `,
    )
    .bind(deviceId, user.sub)
    .first<{ id: string }>()

  if (!device) {
    return NextResponse.json({ error: 'Dispositivo não encontrado' }, { status: 404 })
  }

  const { results } = await env.DB
    .prepare(
      `
      SELECT irms, watts, recorded_at
      FROM energy_readings
      WHERE device_id = ?
      ORDER BY recorded_at DESC
      LIMIT ?
      `,
    )
    .bind(deviceId, limit)
    .all()

  return NextResponse.json({ readings: results.reverse() })
}