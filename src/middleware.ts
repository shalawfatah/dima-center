import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'ar', 'ckb']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current path already has a supported locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Redirect to default locale if no prefix is present
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  // Matcher ignoring internal files, payload admin dashboard, and api routes
  matcher: ['/((?!_next|admin|api|favicon.ico|.*\\..*).*)'],
}
