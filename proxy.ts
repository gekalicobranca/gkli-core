import { NextResponse, type NextRequest } from 'next/server'
import { isRetiredApiPath, isRetiredModulePath } from '@/lib/auth/retired-modules'
import { updateSession } from '@/lib/supabase/middleware'

const ACTIVE_MODULE_ALIASES: Record<string, string> = {
  '/modulos/gkli-new': '/modulos/gkit-new',
  '/modulos/gkli-flex': '/modulos/gkit-flex',
  '/modulos/gkli-ate': '/modulos/gkit-ate',
  '/modulos/gkli-dir': '/modulos/gkit-dir',
}

function aliasModulePath(pathname: string) {
  for (const [visiblePath, internalPath] of Object.entries(ACTIVE_MODULE_ALIASES)) {
    if (pathname === visiblePath || pathname.startsWith(`${visiblePath}/`)) {
      return `${internalPath}${pathname.slice(visiblePath.length)}`
    }
  }

  return null
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionResponse = await updateSession(request)
  const internalModulePath = aliasModulePath(pathname)

  if (internalModulePath) {
    const url = request.nextUrl.clone()
    url.pathname = internalModulePath
    const response = NextResponse.rewrite(url)
    sessionResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie)
    })
    return response
  }

  if (isRetiredApiPath(pathname)) {
    return NextResponse.json({ error: 'Modulo desativado nesta instancia.' }, { status: 404 })
  }

  if (isRetiredModulePath(pathname)) {
    const response = NextResponse.redirect(new URL('/plataforma', request.url))
    sessionResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie)
    })
    return response
  }

  return sessionResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
