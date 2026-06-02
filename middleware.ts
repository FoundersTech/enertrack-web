import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, TOKEN_COOKIE } from '@/lib/auth'

const PROTECTED = ['/dashboard', '/onboarding', '/dispositivos', '/leituras', '/relatorios', '/historico', '/configuracoes', '/minha-conta']
const AUTH_ONLY = ['/login', '/register']

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}

// ✅ Must be named `middleware`, not `proxy`
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = req.cookies.get(TOKEN_COOKIE)?.value
  let user = null

  if (token) {
    try {
      user = await verifyToken(token)
    } catch {
      user = null
    }
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p))

  if (isProtected && !user) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthOnly && user) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}