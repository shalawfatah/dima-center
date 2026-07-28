import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'ar', 'ckb']
const defaultLocale = 'ckb'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  const isBypassPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/media') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')

  const hasBypassCookie =
    request.cookies.get('payload-token')?.value || request.cookies.get('bypass_maintenance')?.value
  const hasBypassParam = request.nextUrl.searchParams.get('preview') === 'true'

  if (hasBypassParam) {
    const url = request.nextUrl.clone()
    url.searchParams.delete('preview')
    const response = NextResponse.redirect(url)
    response.cookies.set('bypass_maintenance', 'true', { path: '/' })
    return response
  }

  // Resolve locale up front so maintenance + normal routing agree
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )
  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value
  const targetLocale = locales.includes(savedLocale as string) ? savedLocale : defaultLocale

  const currentLocale = pathnameHasLocale ? pathname.split('/')[1] : targetLocale

  const isMaintenancePath =
    pathname === `/${currentLocale}/maintenance` || pathname === '/maintenance'

  if (isMaintenanceMode && !isBypassPath && !hasBypassCookie && !isMaintenancePath) {
    const url = request.nextUrl.clone()
    url.pathname = `/${currentLocale}/maintenance`
    return NextResponse.redirect(url)
  }

  if (isMaintenancePath) {
    // still normalize to locale-prefixed form if hit bare
    if (pathname === '/maintenance') {
      const url = request.nextUrl.clone()
      url.pathname = `/${currentLocale}/maintenance`
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (pathnameHasLocale) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${targetLocale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export default proxy

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|media|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
