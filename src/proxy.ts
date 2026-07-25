import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'ar', 'ckb']
const defaultLocale = 'ckb'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return NextResponse.next()

  const savedLocale = request.cookies.get('NEXT_LOCALE')?.value
  const targetLocale = locales.includes(savedLocale as string) ? savedLocale : defaultLocale

  request.nextUrl.pathname = `/${targetLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!_next|admin|api|favicon.ico|.*\\..*).*)'],
}
