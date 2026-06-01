import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getEnv } from '@/lib/db'

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export async function POST(req: NextRequest) {
  const env = await getEnv(req)

  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()

  const token = await env.DB
    .prepare(
      `
      SELECT id
      FROM password_reset_tokens
      WHERE email = ?
        AND code = ?
        AND used = 0
        AND expires_at > unixepoch()
      ORDER BY created_at DESC
      LIMIT 1
      `,
    )
    .bind(email, parsed.data.code)
    .first<{ id: string }>()

  if (!token) {
    return NextResponse.json({ error: 'Código inválido ou expirado' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}