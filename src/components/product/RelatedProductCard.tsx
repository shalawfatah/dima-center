import Link from 'next/link'
import Image from 'next/image'
import { calculateProductPrice } from '@/utils/price'
import DiscountBadge from './DiscountBadge'
import ProductPriceDisplay from './ProductPriceDisplay'

interface RelatedProductCardProps {
  item: any
  currentLocale: string
  isRtl: boolean
  exchangeRate: number
}

export default function RelatedProductCard({
  item,
  currentLocale,
  isRtl,
  exchangeRate,
}: RelatedProductCardProps) {
  const itemImgObj = item.featuredImage && typeof item.featuredImage === 'object'
  const itemImgUrl = itemImgObj ? (item.featuredImage as any).url : null

  const priceSpecs = calculateProductPrice({
    ...item,
    hasDiscount: item.hasDiscount ?? false,
  } as any)

  const usdPrice = Number(priceSpecs.finalPrice)
  const iqdPrice = usdPrice * exchangeRate

  return (
    <Link
      href={`/${currentLocale}/products/${item.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          border: '1px solid #eee',
          borderRadius: '8px',
          padding: '1rem',
          background: '#fff',
          position: 'relative',
        }}
      >
        {priceSpecs.isDiscounted && (
          <DiscountBadge
            badgeText={priceSpecs.badgeText ?? ''}
            currentLocale={currentLocale}
            isRtl={isRtl}
            size="small"
            localizeOffLabel={false}
          />
        )}

        <div
          style={{
            width: '100%',
            height: '140px',
            background: '#fcfcfc',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '0.75rem',
          }}
        >
          {itemImgUrl ? (
            <Image
              width={400}
              height={400}
              src={itemImgUrl}
              alt={item.title ?? 'image'}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ddd',
                fontSize: '12px',
              }}
            >
              📦 No Image
            </div>
          )}
        </div>
        <h4
          style={{
            fontFamily: '"Rudaw", sans-serif',
            color: '#1e293b',
            fontSize: '14px',
            margin: '0 0 0.5rem 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.title}
        </h4>

        <ProductPriceDisplay
          variant="card"
          finalPrice={usdPrice}
          originalPrice={Number(priceSpecs.originalPrice)}
          isDiscounted={priceSpecs.isDiscounted}
          iqdPrice={iqdPrice}
          currentLocale={currentLocale}
        />
      </div>
    </Link>
  )
}
