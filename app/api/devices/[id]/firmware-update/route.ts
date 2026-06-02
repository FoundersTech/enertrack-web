import { NextRequest, NextResponse } from 'next/server'
import { TOKEN_COOKIE, verifyToken } from '@/lib/auth'
import { getEnv } from '@/lib/db'

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const env = await getEnv(req)

  const token = req.cookies.get(TOKEN_COOKIE)?.value
  const user = token ? await verifyToken(token, env) : null

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const latestFirmware = await env.DB
    .prepare(
      `
      SELECT version
      FROM firmware_versions
      WHERE active = 1
      ORDER BY created_at DESC
      LIMIT 1
      `,
    )
    .first<{ version: string }>()

  if (!latestFirmware) {
    return NextResponse.json({ error: 'Nenhum firmware ativo encontrado' }, { status: 404 })
  }

  const device = await env.DB
    .prepare(
      `
      UPDATE devices
      SET
        target_firmware_version = ?,
        firmware_update_requested = 1,
        firmware_update_status = 'pending'
      WHERE id = ?
        AND user_id = ?
        AND active = 1
      RETURNING
        id,
        firmware_version,
        target_firmware_version,
        firmware_update_requested,
        firmware_update_status
      `,
    )
    .bind(latestFirmware.version, id, user.sub)
    .first()

  if (!device) {
    return NextResponse.json({ error: 'Dispositivo não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ device })
}