import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import { CartProvider } from '../../components/cart/CartContext'

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  return (
    <html lang={locale}>
      <body>
        {/* Injecting context layers enables instant checkout calls from anywhere */}
        <CartProvider user={user} currentLocale={locale}>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
