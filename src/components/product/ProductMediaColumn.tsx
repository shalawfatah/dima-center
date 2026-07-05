import ProductGallery from '@/components/ProductGallery'
import DiscountBadge from './DiscountBadge'
import TechnicalSpecsTable from './TechnicalSpecsTable'

interface ProductMediaColumnProps {
  title: string
  featuredImageUrl: string | null
  imagesGallery: any
  isRtl: boolean
  currentLocale: string
  isDiscounted: boolean
  badgeText: string
  technicalSpecs?: any[]
}

export default function ProductMediaColumn({
  title,
  featuredImageUrl,
  imagesGallery,
  isRtl,
  currentLocale,
  isDiscounted,
  badgeText,
  technicalSpecs,
}: ProductMediaColumnProps) {
  return (
    <div style={{ position: 'relative' }}>
      {isDiscounted && (
        <DiscountBadge
          badgeText={badgeText}
          currentLocale={currentLocale}
          isRtl={isRtl}
          size="large"
        />
      )}

      <ProductGallery
        title={title}
        featuredImageUrl={featuredImageUrl}
        imagesGallery={imagesGallery}
        isRtl={isRtl}
      />

      <TechnicalSpecsTable specs={technicalSpecs} currentLocale={currentLocale} isRtl={isRtl} />
    </div>
  )
}
