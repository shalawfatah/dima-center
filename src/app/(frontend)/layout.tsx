import './styles.css'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { CartProvider } from '../../components/cart/CartContext'

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale?: string }> // 👈 Changed to optional to satisfy Next.js static routing
}) {
  // 1. Await and extract the locale from route params, fallback to 'en' if undefined
  const { locale = 'en' } = await params

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  // Determine reading direction dynamically based on locale string
  const isRtl = locale === 'ar' || locale === 'ckb'

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
      <body>
        <CartProvider user={user} currentLocale={locale}>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
