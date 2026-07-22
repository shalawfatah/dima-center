import Link from 'next/link'
import Image from 'next/image'
import { calculateProductPrice } from '@/utils/price'
import DiscountBadge from './DiscountBadge'
import ProductPriceDisplay from './ProductPriceDisplay'
import { RelatedProductCardProps } from '@/types/types'
import styles from '@/styles/related_product_card.module.css'

/**
 * Safely extracts image URL from both Products (featuredImage) and UIProducts (image)
 */
function resolveProductImage(item: any): string | null {
  if (!item) return null

  // 1. Check for `featuredImage` (Products collection)
  const featImg = item.featuredImage
  if (featImg && typeof featImg === 'object' && featImg.url) {
    return featImg.url
  }
  if (typeof featImg === 'string') {
    return featImg
  }

  // 2. Check for `image` (UIProducts collection)
  const uiImg = item.image
  if (uiImg && typeof uiImg === 'object' && uiImg.url) {
    return uiImg.url
  }
  if (typeof uiImg === 'string') {
    return uiImg
  }

  return null
}

export default function RelatedProductCard({
  item,
  currentLocale,
  isRtl,
  exchangeRate,
}: RelatedProductCardProps) {
  // 🎯 Resolve image for both Products and UIProducts
  const itemImgUrl = resolveProductImage(item)

  // 1. Dynamic Category Slug Resolution
  let categorySlug = 'products'
  const categoryObj = item?.category || item?.uiCategory

  if (item?.categorySlug) {
    categorySlug = item.categorySlug
  } else if (categoryObj && typeof categoryObj === 'object') {
    const rawSlug = categoryObj.slug
    if (typeof rawSlug === 'object' && rawSlug !== null) {
      categorySlug =
        rawSlug[currentLocale] ||
        rawSlug.en ||
        rawSlug.ckb ||
        rawSlug.ar ||
        Object.values(rawSlug)[0] ||
        'products'
    } else if (typeof rawSlug === 'string') {
      categorySlug = rawSlug
    }
  }

  // 2. Resolve Product Identifier (prefer slug over id)
  const productIdentifier = item?.slug || item?.id

  // 3. Construct Dynamic Path -> /[locale]/[categorySlug]/[productIdentifier]
  const productHref = `/${currentLocale}/${categorySlug}/${productIdentifier}`

  const priceSpecs = calculateProductPrice({
    ...item,
    hasDiscount: item?.hasDiscount ?? false,
  } as any)
  const usdPrice = Number(priceSpecs.finalPrice)
  const iqdPrice = usdPrice * exchangeRate

  return (
    <Link href={productHref} className={styles.cardLink}>
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
              alt={item?.title ?? 'Product image'}
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder}>📦 No Image</div>
          )}
        </div>

        <h4 className={styles.title}>{item?.title || item?.name}</h4>

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
