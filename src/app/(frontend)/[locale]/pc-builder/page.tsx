import { getPayload } from 'payload'
import config from '@/payload.config'
import PcBuilderClient from '@/components/PcBuilderClient'
import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  return getStorefrontMetadata({ locale: resolvedParams.locale })
}

// Statically optimize compilation rules
export const revalidate = 3600 // Cache for 1 hour, revalidate in background

export default async function PcBuilderPage({ params }: PageProps) {
  const { locale } = await params
  const payload = await getPayload({ config })

  // Fetch only necessary data fields to speed up build generation
  const productsData = await payload.find({
    collection: 'products',
    where: {
      stock: { greater_than: 0 },
    },
    select: {
      id: true,
      title: true,
      price: true,
      priceIQD: true,
      hasDiscount: true,
      discountType: true,
      discountValue: true,
      category: true,
      cat: true,
      featuredImage: true,
      meta: true,
    },
    limit: 0,
    pagination: false,
    locale: locale as 'en' | 'ar' | 'ckb',
  })

  // Fetch corporate currency constants safely
  const generalsData = await payload
    .findGlobal({
      slug: 'general-settings',
      locale: locale as 'en' | 'ar' | 'ckb',
    })
    .catch(() => null)

  const isRtl = locale === 'ar' || locale === 'ckb'

  // ✅ FIX TYPE ERROR: Sanitize database 'null' properties to meet Client Component expectations
  const sanitizedGenerals = generalsData
    ? JSON.parse(JSON.stringify(generalsData, (_, value) => (value === null ? undefined : value)))
    : undefined

  return (
    <PcBuilderClient
      products={productsData.docs}
      generals={sanitizedGenerals}
      currentLocale={locale}
      isRtl={isRtl}
    />
  )
}
