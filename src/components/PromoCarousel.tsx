import { getPayload } from 'payload'
import config from '@/payload.config'
import PromoCarouselClient from './PromoCarouselClient'

interface PromoCarouselProps {
  currentLocale: string
}

export default async function PromoCarousel({ currentLocale }: PromoCarouselProps) {
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

  // DEBUG 1: Did we find the category?
  if (!promoCategory) {
    return null
  }

  // 2. Fetch UI Products linked to this category ID or slug
  const promoData = await payload.find({
    collection: 'ui-products',
    locale: currentLocale as 'en' | 'ar' | 'ckb',
    fallbackLocale: 'en', // Automatically fallback to English if string is missing
    draft: true, // 👈 CRITICAL: Fetch drafts too in case items aren't published
    overrideAccess: true, // 👈 Bypasses access control restriction checks on local API
    where: {
      uiCategory: {
        equals: promoCategory.id,
      },
    },
    sort: 'order',
    depth: 2,
  })

  // DEBUG 2: Fallback query if category ID match returns 0 (handling relation type differences)
  let promotions = promoData.docs

  if (promotions.length === 0) {
    const fallbackData = await payload.find({
      collection: 'ui-products',
      locale: currentLocale as 'en' | 'ar' | 'ckb',
      fallbackLocale: 'en',
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

  return <PromoCarouselClient promotions={promotions} currentLocale={currentLocale} isRtl={isRtl} />
}
