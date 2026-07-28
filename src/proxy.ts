// src/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'ar', 'ckb']
const defaultLocale = 'ckb'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Maintenance Mode
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  const isBypassPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname === '/maintenance' ||
    pathname.startsWith('/maintenance/')

  const hasBypassCookie =
    request.cookies.get('payload-token')?.value || request.cookies.get('bypass_maintenance')?.value
  const hasBypassParam = request.nextUrl.searchParams.get('preview') === 'true'

  if (hasBypassParam) {
    const url = request.nextUrl.clone()
    const response = NextResponse.redirect(url)
    response.cookies.set('bypass_maintenance', 'true', { path: '/' })
    return response
  }

  if (isMaintenanceMode && !isBypassPath && !hasBypassCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.rewrite(url)
  }

  // 2. Locale Routing
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return NextResponse.next()

  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value
  const targetLocale = locales.includes(savedLocale as string) ? savedLocale : defaultLocale

  const url = request.nextUrl.clone()
  url.pathname = `/${targetLocale}${pathname}`
  return NextResponse.redirect(url)
}

export default proxy

export const config = {
  matcher: ['/((?!_next|admin|api|favicon.ico|.*\\..*).*)'],
}
