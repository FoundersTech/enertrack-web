import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { TOKEN_COOKIE, verifyToken } from '@/lib/auth'
import { getEnv } from '@/lib/db'

const updateSchema = z.object({
  name: z.string().min(1).max(80),
  location: z.string().max(80).nullable().optional(),
  electrical_config: z.enum([
    '127v_monofasico',
    '220v_monofasico',
    '220v_trifasico',
    '380v_trifasico',
  ]),
})

type Params = {
  params: Promise<{ id: string }>
}

async function getAuthenticatedUser(req: NextRequest) {
  const env = await getEnv(req)
  const token = req.cookies.get(TOKEN_COOKIE)?.value
  const user = token ? await verifyToken(token, env) : null

  return { env, user }
}

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { env, user } = await getAuthenticatedUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const device = await env.DB
    .prepare(
      `
      SELECT
        id,
        mac_address,
        name,
        location,
        electrical_config,
        registered_at,
        firmware_version,
        target_firmware_version,
        firmware_update_requested,
        firmware_update_status,
        firmware_updated_at,
        last_seen_at
      FROM devices
      WHERE id = ?
        AND user_id = ?
        AND active = 1
      LIMIT 1
      `,
    )
    .bind(id, user.sub)
    .first()

  if (!device) {
    return NextResponse.json({ error: 'Dispositivo não encontrado' }, { status: 404 })
  }

  const latestFirmware = await env.DB
    .prepare(
      `
      SELECT version, binary_url, changelog, created_at
      FROM firmware_versions
      WHERE active = 1
      ORDER BY created_at DESC
      LIMIT 1
      `,
    )
    .first()

  return NextResponse.json({ device, latest_firmware: latestFirmware })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { env, user } = await getAuthenticatedUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { name, location, electrical_config } = parsed.data

  const device = await env.DB
    .prepare(
      `
      UPDATE devices
      SET
        name = ?,
        location = ?,
        electrical_config = ?
      WHERE id = ?
        AND user_id = ?
        AND active = 1
      RETURNING
        id,
        mac_address,
        name,
        location,
        electrical_config,
        registered_at,
        firmware_version,
        target_firmware_version,
        firmware_update_requested,
        firmware_update_status,
        firmware_updated_at,
        last_seen_at
      `,
    )
    .bind(name, location ?? null, electrical_config, id, user.sub)
    .first()

  if (!device) {
    return NextResponse.json({ error: 'Dispositivo não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ device })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { env, user } = await getAuthenticatedUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const result = await env.DB
    .prepare(
      `
      UPDATE devices
      SET active = 0
      WHERE id = ?
        AND user_id = ?
        AND active = 1
      `,
    )
    .bind(id, user.sub)
    .run()

  if (!result.meta.changes) {
    return NextResponse.json({ error: 'Dispositivo não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}