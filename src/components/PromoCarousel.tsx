import { getPayload } from 'payload'
import config from '@/payload.config'
import PromoCarouselClient from './PromoCarouselClient'

interface PromoCarouselProps {
  currentLocale: string
  headingFont?: string
  bodyFont?: string
  dynamicFontFaceCSS?: string
}

export default async function PromoCarousel({
  currentLocale,
  headingFont,
  bodyFont,
  dynamicFontFaceCSS,
}: PromoCarouselProps) {
  const payload = await getPayload({ config })

  const categoryResult = await payload.find({
    collection: 'ui-categories',
    where: {
      slug: {
        equals: 'promotions',
      },
    },
    limit: 1,
  })

  const promoCategory = categoryResult.docs[0]

  if (!promoCategory) {
    return null
  }

  // 1. Fetch UI Products with locale: 'all' so every translation object is passed to client
  const promoData = await payload.find({
    collection: 'ui-products',
    locale: 'all', // 🎯 CRITICAL FIX: Retains en, ar, and ckb keys in returned fields
    draft: true,
    overrideAccess: true,
    where: {
      uiCategory: {
        equals: promoCategory.id,
      },
    },
    sort: 'order',
    depth: 2,
  })

  let promotions = promoData.docs

  // 2. Fallback query with locale: 'all' as well
  if (promotions.length === 0) {
    const fallbackData = await payload.find({
      collection: 'ui-products',
      locale: 'all', // 🎯 CRITICAL FIX
      draft: true,
      overrideAccess: true,
      where: {
        'uiCategory.slug': {
          equals: 'promotions',
        },
      },
      sort: 'order',
      depth: 2,
    })

    promotions = fallbackData.docs
  }

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  if (!promotions || promotions.length === 0) return null

  return (
    <PromoCarouselClient
      promotions={promotions}
      currentLocale={currentLocale}
      isRtl={isRtl}
      headingFont={headingFont}
      bodyFont={bodyFont}
      dynamicFontFaceCSS={dynamicFontFaceCSS}
    />
  )
}
