import { getPayload } from 'payload'
import config from '@/payload.config'
import PromoCarouselClient from './PromoCarouselClient'

interface PromoCarouselProps {
  currentLocale: string
}

export default async function PromoCarousel({ currentLocale }: PromoCarouselProps) {
  const payload = await getPayload({ config })

  // Fetch active promotions sorted by newest first (-createdAt)
  const promoData = await payload.find({
    collection: 'promotions',
    locale: currentLocale as 'en' | 'ar' | 'ckb',
    where: {
      isActive: {
        equals: true,
      },
    },
    sort: '-createdAt',
  })

  const promotions = promoData.docs
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  if (!promotions || promotions.length === 0) return null

  return <PromoCarouselClient promotions={promotions} currentLocale={currentLocale} isRtl={isRtl} />
}
