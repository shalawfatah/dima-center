import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import PcBuilderClient from '@/components/PcBuilderClient'

interface PcBuilderPageProps {
  params: Promise<{ locale: string }>
}

export default async function PcBuilderPage({ params }: PcBuilderPageProps) {
  const { locale } = await params
  const payload = await getPayload({ config })

  // 🔐 Check user session status securely on the server
  const { user } = await payload.auth({ headers: await headers() })

  // Fetch all active products to act as components
  const productsData = await payload.find({
    collection: 'products',
    limit: 100,
    locale: locale as 'en' | 'ar' | 'ckb',
  })

  // Group products by categories or simply pass them directly
  const products = productsData.docs
  const isRtl = locale === 'ar' || locale === 'ckb'

  return <PcBuilderClient products={products} user={user} currentLocale={locale} isRtl={isRtl} />
}
