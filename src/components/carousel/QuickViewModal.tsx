'use client'

import { ProductItem } from '@/types/types'
import styles from '@/styles/product_carousel.module.css'
import { getDiscountedPrice, getNumericalPrice } from '@/utils/product_helpers'
import { carouselDictionary } from '@/utils/carousel_dictionary'

type Dictionary = (typeof carouselDictionary)['en']

interface QuickViewModalProps {
  product: ProductItem
  currentLocale: string
  t: Dictionary
  onClose: () => void
  onAddToCart: (e: React.MouseEvent, product: ProductItem) => void
}

/**
 * 🎯 Safely extracts plain text out of Strings, JSON Strings, Localized Objects, or Lexical ASTs
 */
function resolvePlainText(val: any, locale: string): string {
  if (!val) return ''

  let target = val

  // 1. If it's a JSON-stringified object/AST, parse it first
  if (typeof target === 'string' && target.trim().startsWith('{')) {
    try {
      target = JSON.parse(target)
    } catch {
      // Retain standard string if parsing fails
    }
  }

  // 2. Direct string return
  if (typeof target === 'string') {
    return target.trim()
  }

  // 3. Handle Objects (Dictionaries & Lexical Rich Text ASTs)
  if (typeof target === 'object' && target !== null) {
    //  Lexical / Slate Rich Text AST check
    if (target.root || Array.isArray(target.children)) {
      try {
        const extractTextFromNodes = (nodes: any[]): string => {
          if (!Array.isArray(nodes)) return ''
          return nodes
            .map((node) => {
              if (node.text) return node.text
              if (node.children) return extractTextFromNodes(node.children)
              return ''
            })
            .filter(Boolean)
            .join(' ')
        }

        const children = target.root?.children || target.children || []
        const parsedText = extractTextFromNodes(children).trim()
        if (parsedText) return parsedText
      } catch {
        // Fallthrough to dictionary check
      }
    }

    // Localized Dictionary Object check (locale -> en -> ar -> ckb -> any string)
    const matchedStr =
      target[locale] ||
      target.en ||
      target.ar ||
      target.ckb ||
      Object.values(target).find((v) => typeof v === 'string' && (v as string).trim() !== '')

    if (typeof matchedStr === 'string') {
      return matchedStr.trim()
    }
  }

  return ''
}

export default function QuickViewModal({
  product,
  currentLocale,
  t,
  onClose,
  onAddToCart,
}: QuickViewModalProps) {
  const title = resolvePlainText(product?.title || product?.name, currentLocale) || 'Product'
  const description = resolvePlainText(
    product?.description || product?.descriptionSnippet,
    currentLocale,
  )
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
