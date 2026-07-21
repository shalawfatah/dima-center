'use client'

import { ProductItem } from '@/types/types'
import styles from '@/styles/product_carousel.module.css'
import { getDiscountedPrice, getFallbackText, getNumericalPrice } from '@/utils/product_helpers'
import { carouselDictionary } from '@/utils/carousel_dictionary'

type Dictionary = (typeof carouselDictionary)['en']

interface QuickViewModalProps {
  product: ProductItem
  currentLocale: string
  t: Dictionary
  onClose: () => void
  onAddToCart: (e: React.MouseEvent, product: ProductItem) => void
}

export default function QuickViewModal({
  product,
  currentLocale,
  t,
  onClose,
  onAddToCart,
}: QuickViewModalProps) {
  const title = getFallbackText(product, 'title', currentLocale)
  const description = getFallbackText(product, 'description', currentLocale)
  const price = product.hasDiscount ? getDiscountedPrice(product) : getNumericalPrice(product.price)

  return (
    <div className={styles['pc-modal-backdrop']} onClick={onClose}>
      <div className={styles['pc-modal-content']} onClick={(e) => e.stopPropagation()}>
        <button className={styles['pc-modal-close']} onClick={onClose}>
          ✕
        </button>
        <h2 className={styles['pc-modal-title']}>{title}</h2>
        <div className={styles['pc-modal-price']}>
          {t.currency}
          {price.toLocaleString()}
        </div>
        <div className={styles['pc-modal-desc']}>{description}</div>
        <button
          className={styles['pc-modal-addcart']}
          onClick={(e) => {
            onClose()
            onAddToCart(e, product)
          }}
        >
          {t.addToCart}
        </button>
      </div>
    </div>
  )
}
