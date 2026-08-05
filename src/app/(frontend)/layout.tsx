import './styles.css'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { CartProvider } from '../../components/cart/CartContext'
import { DynamicFonts } from '@/components/DynamicFonts' // 👈 Import the injector component

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale?: string }>
}) {
  // 1. Await and extract the locale from route params, fallback to 'en' if undefined
  const { locale = 'en' } = await params

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  // Determine reading direction dynamically based on locale string
  const isRtl = locale === 'ar' || locale === 'ckb'

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
      <head>
        <script
          defer
          src="https://analytics.dima.center/script.js"
          data-website-id="79bb66b4-ed56-4758-a041-b9c9cea33f71"
        ></script>
        {/* 👈 Inject dynamic font-face definitions & CSS variable overrides */}
        <DynamicFonts locale={locale} />
      </head>
      <body>
        <CartProvider user={user} currentLocale={locale}>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
