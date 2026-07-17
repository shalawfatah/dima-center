import Link from 'next/link'
import Image from 'next/image'
import { calculateProductPrice } from '@/utils/price'
import DiscountBadge from './DiscountBadge'
import ProductPriceDisplay from './ProductPriceDisplay'
import { RelatedProductCardProps } from '@/types/types'
import styles from '@/styles/related_product_card.module.css'

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
    <Link href={`/${currentLocale}/products/${item.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        {priceSpecs.isDiscounted && (
          <DiscountBadge
            badgeText={priceSpecs.badgeText ?? ''}
            currentLocale={currentLocale}
            isRtl={isRtl}
            size="small"
            localizeOffLabel={false}
          />
        )}

        <div className={styles.imageWrapper}>
          {itemImgUrl ? (
            <Image
              width={400}
              height={400}
              src={itemImgUrl}
              alt={item.title ?? 'image'}
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder}>📦 No Image</div>
          )}
        </div>

        <h4 className={styles.title}>{item.title}</h4>

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
