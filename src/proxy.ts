import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'ar', 'ckb']
const defaultLocale = 'ckb'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Check Maintenance Mode flag from environment variables
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  // Paths that should ALWAYS bypass maintenance mode
  const isBypassPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname === '/maintenance' ||
    pathname.startsWith('/maintenance/')

  // Allow admins or testers to bypass maintenance by visiting ?preview=true once
  const hasBypassCookie =
    request.cookies.get('payload-token')?.value || request.cookies.get('bypass_maintenance')?.value
  const hasBypassParam = request.nextUrl.searchParams.get('preview') === 'true'

  if (hasBypassParam) {
    const response = NextResponse.redirect(request.nextUrl)
    response.cookies.set('bypass_maintenance', 'true', { path: '/' })
    return response
  }

  // 2. Handle Maintenance Mode Redirection
  if (isMaintenanceMode && !isBypassPath && !hasBypassCookie) {
    // Rewrite directly to root /maintenance (outside [locale])
    request.nextUrl.pathname = '/maintenance'
    return NextResponse.rewrite(request.nextUrl)
  }

  // 3. Original Locale Routing Logic
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return NextResponse.next()

  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value
  const targetLocale = locales.includes(savedLocale as string) ? savedLocale : defaultLocale

  request.nextUrl.pathname = `/${targetLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export default proxy

export const config = {
  matcher: ['/((?!_next|admin|api|favicon.ico|.*\\..*).*)'],
}
