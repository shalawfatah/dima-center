import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import PcBuilderClient from '@/components/PcBuilderClient'

import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; [key: string]: any }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  return getStorefrontMetadata({ locale: resolvedParams.locale })
}

interface PcBuilderPageProps {
  params: Promise<{ locale: string }>
}

export default async function PcBuilderPage({ params }: PcBuilderPageProps) {
  const { locale } = await params
  const payload = await getPayload({ config })

  // 🔐 Check user session status securely on the server
  const { user } = await payload.auth({ headers: await headers() })

  // Fetch all active products to act as components (Only items with stock > 0)
  const productsData = await payload.find({
    collection: 'products',
    where: {
      stock: { greater_than: 0 },
    },
    limit: 0,
    pagination: false,
    locale: locale as 'en' | 'ar' | 'ckb',
  })

  // Group products by categories or simply pass them directly
  const products = productsData.docs
  const isRtl = locale === 'ar' || locale === 'ckb'

  return <PcBuilderClient products={products} user={user} currentLocale={locale} isRtl={isRtl} />
}
