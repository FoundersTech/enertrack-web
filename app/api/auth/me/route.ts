import { NextRequest, NextResponse } from 'next/server'
import { TOKEN_COOKIE, verifyToken } from '@/lib/auth'
import { getEnv } from '@/lib/db'

export async function GET(req: NextRequest) {
  const env = await getEnv(req)
  const token = req.cookies.get(TOKEN_COOKIE)?.value
  const payload = token ? await verifyToken(token, env) : null

  if (!payload) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const user = await env.DB
    .prepare('SELECT id, name, email FROM users WHERE id = ?')
    .bind(payload.sub)
    .first<{ id: string; name: string; email: string }>()

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ user })
}
