'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ProductItem } from '@/types/types'
import styles from '@/styles/product_carousel.module.css'
import { resolveImageUrl } from '@/utils/resolve_image_url'
import { getDiscountedPrice, getFallbackText, getNumericalPrice } from '@/utils/product_helpers'
import { carouselDictionary } from '@/utils/carousel_dictionary'

type Dictionary = (typeof carouselDictionary)['en']

interface ProductCardProps {
  product: ProductItem
  currentLocale: string
  cardWidth: number
  cardHeight: number
  productPath: string
  t: Dictionary
  onQuickView: (product: ProductItem) => void
  onAddToCart: (e: React.MouseEvent, product: ProductItem) => void
}

export default function ProductCard({
  product,
  currentLocale,
  cardWidth,
  cardHeight,
  productPath,
  t,
  onQuickView,
  onAddToCart,
}: ProductCardProps) {
  const currentTitle = getFallbackText(product, 'title', currentLocale)
  const imageUrl = resolveImageUrl(product)

  const imageAlt =
    product.featuredImage && typeof product.featuredImage === 'object'
      ? product.featuredImage.alt || currentTitle
      : currentTitle

  const hasDiscount = !!product.hasDiscount
  const originalPrice = getNumericalPrice(product.price)
  const finalPrice = getDiscountedPrice(product)
  const priceIQDValue = product.priceIQD ? getNumericalPrice(product.priceIQD) : null

  return (
    <Link
      href={productPath}
      className={`${styles['product-carousel-slide']} ${styles['pc-slide-link']}`}
      draggable={false}
      style={
        {
          '--pc-card-width': `${cardWidth}px`,
          '--pc-card-height': `${cardHeight}px`,
        } as React.CSSProperties
      }
    >
      <div className={styles['product-card-inner']}>
        {hasDiscount && (
          <div className={styles['pc-discount-badge']}>
            {product.discountType === 'percentage'
              ? `-${product.discountValue}% ${t.discountLabel}`
              : `-$${product.discountValue} ${t.discountLabel}`}
          </div>
        )}

        <div className={styles['pc-image-container']}>
          {imageUrl ? (
            <Image
              width={cardWidth}
              height={cardHeight}
              sizes="(max-width: 640px) 50vw, 220px"
              src={imageUrl}
              alt={imageAlt}
              className={styles['product-parallax-img']}
              priority={false}
            />
          ) : (
            <div className={styles['pc-image-placeholder']}>📦</div>
          )}
        </div>

        <div className={styles['side-actions-wrapper']}>
          <button
            className={styles['side-action-btn']}
            onClick={(e) => {
              e.preventDefault()
              onQuickView(product)
            }}
            title={t.quickViewTitle}
          >
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <button
            className={styles['side-action-btn']}
            onClick={(e) => {
              e.preventDefault()
              const targetUrl = `${window.location.origin}${productPath}`
              navigator.clipboard.writeText(targetUrl)
              alert('Copied!')
            }}
            title={t.shareTitle}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 00-6 6v3"
              />
            </svg>
          </button>
        </div>

        <div className={styles['pc-info-panel']}>
          <h3 className={styles['pc-title']}>{currentTitle}</h3>
          <div className={styles['pc-price-container']}>
            <div className={styles['pc-price-row']}>
              {hasDiscount ? (
                <div className={styles['pc-price-group']}>
                  <span className={styles['pc-price-final']}>
                    {t.currency}
                    {finalPrice.toLocaleString()}
                  </span>
                  <span className={styles['pc-price-original']}>
                    {t.currency}
                    {originalPrice.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className={styles['pc-price-final']}>
                  {t.currency}
                  {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {priceIQDValue !== null && priceIQDValue > 0 && (
              <span className={styles['pc-iqd-badge']}>
                {priceIQDValue.toLocaleString()} IQD د.ع
              </span>
            )}
          </div>
        </div>

        <div className={styles['hover-cart-overlay']}>
          <button className={styles['hover-cart-btn']} onClick={(e) => onAddToCart(e, product)}>
            {t.addToCart}
          </button>
        </div>
      </div>
    </Link>
  )
}
