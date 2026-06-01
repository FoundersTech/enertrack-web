import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getEnv } from '@/lib/db'

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(8).max(72),
})

export async function POST(req: NextRequest) {
  const env = await getEnv(req)

  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const email = parsed.data.email.trim().toLowerCase()

  const token = await env.DB
    .prepare(
      `
      SELECT id, user_id
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
    .first<{ id: string; user_id: string }>()

  if (!token) {
    return NextResponse.json({ error: 'Código inválido ou expirado' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)

  await env.DB.batch([
    env.DB
      .prepare(
        `
        UPDATE users
        SET password = ?
        WHERE id = ?
        `,
      )
      .bind(passwordHash, token.user_id),

    env.DB
      .prepare(
        `
        UPDATE password_reset_tokens
        SET used = 1
        WHERE id = ?
        `,
      )
      .bind(token.id),
  ])

  return NextResponse.json({ ok: true })
}