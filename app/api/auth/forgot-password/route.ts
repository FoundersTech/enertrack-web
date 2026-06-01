import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getEnv } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { buildPasswordResetEmail } from '@/lib/email-templates/password-reset'

const schema = z.object({
    email: z.string().email(),
})

function generateOtpCode() {
    return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: NextRequest) {
    const env = await getEnv(req)

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const email = parsed.data.email.trim().toLowerCase()

    const user = await env.DB
        .prepare('SELECT id, name, email FROM users WHERE lower(email) = ? LIMIT 1')
        .bind(email)
        .first<{ id: string; name: string | null; email: string }>()

    if (!user) {
        return NextResponse.json({ ok: true })
    }

    const code = generateOtpCode()
    const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60

    await env.DB
        .prepare(
            `
      INSERT INTO password_reset_tokens (user_id, email, code, expires_at)
      VALUES (?, ?, ?, ?)
      `,
        )
        .bind(user.id, email, code, expiresAt)
        .run()

    const html = buildPasswordResetEmail({
        userName: user.name,
        otpCode: code,
        expiresInMinutes: 10,
    })

    await sendEmail(env, {
        to: user.email,
        subject: 'Código para redefinir sua senha - EnerTrack',
        html,
        text: `Seu código para redefinir a senha é ${code}. Ele expira em 10 minutos.`,
    })

    return NextResponse.json({ ok: true })
}