// @/utils/product_helpers.ts

import { ProductItem } from '@/types/types'

export function getNumericalPrice(price: number | string | null | undefined): number {
  if (!price) return 0
  if (typeof price === 'string') {
    return parseFloat(price.replace(/,/g, '')) || 0
  }
  return price
}

export function getDiscountedPrice(product: ProductItem): number {
  const originalPrice = getNumericalPrice(product.price)
  if (!product.hasDiscount || !product.discountValue) return originalPrice

  if (product.discountType === 'percentage') {
    return Math.max(0, originalPrice - (originalPrice * product.discountValue) / 100)
  }
  return Math.max(0, originalPrice - product.discountValue)
}

export function isMonitorCategory(product: ProductItem): boolean {
  if (!product.category) return false

  if (typeof product.category === 'object') {
    const cat = product.category as any
    const slug = String(cat.slug || '').toLowerCase()
    const titleEn = String(cat.title?.en || cat.title || '').toLowerCase()
    const nameEn = String(cat.name?.en || cat.name || '').toLowerCase()

    return (
      slug === 'monitor' || slug === 'monitors' || titleEn === 'monitor' || nameEn === 'monitor'
    )
  }
  return String(product.category).toLowerCase() === 'monitor'
}

export function sortProductsForDisplay(products: ProductItem[]): ProductItem[] {
  if (!products || !Array.isArray(products)) return []

  const manualOffers: ProductItem[] = []
  const discountedProducts: ProductItem[] = []
  const monitorProducts: ProductItem[] = []
  const defaultProducts: ProductItem[] = []

  for (const product of products) {
    if (product.isCaseOffer) {
      manualOffers.push(product)
    } else if (product.hasDiscount) {
      discountedProducts.push(product)
    } else if (isMonitorCategory(product)) {
      monitorProducts.push(product)
    } else {
      defaultProducts.push(product)
    }
  }

  return [...manualOffers, ...discountedProducts, ...monitorProducts, ...defaultProducts]
}

type LocalizableField = 'title' | 'description'

/**
 * Safe internal helper to ensure a value is a non-empty, non-whitespace string
 */
function sanitizeString(val: any): string | null {
  if (typeof val === 'string' && val.trim() !== '') {
    return val.trim()
  }
  return null
}

/**
 * 🎯 Robust Localized & Fallback Text Extractor
 * Priority Order:
 * 1. Direct raw string on product[fieldType]
 * 2. Localized dictionary object: Requested Locale -> CKB -> EN -> AR -> First available string
 * 3. Rich Text / AST content (if present)
 * 4. Explicit fallback properties on root level (e.g. title_ckb, titleCkb, title_en)
 * 5. Candidate fallback fields (name, productName, label, slug)
 */
// @/utils/product_helpers.ts

export function getFallbackText(
  product: ProductItem | any,
  fieldType: LocalizableField,
  currentLocale: string,
): string {
  if (!product) return ''

  // Safe internal string sanitizer
  const sanitize = (val: any): string | null => {
    if (typeof val === 'string' && val.trim() !== '') return val.trim()
    return null
  }

  // 1. Get raw field from current product level
  const rawVal = product[fieldType]

  // 2. Direct non-empty string
  const directStr = sanitize(rawVal)
  if (directStr) return directStr

  // 3. Localized object or Lexical/Slate AST
  if (typeof rawVal === 'object' && rawVal !== null) {
    // Rich Text AST check
    if (rawVal.root || Array.isArray(rawVal.children)) {
      try {
        const children = rawVal.root?.children || rawVal.children || []
        const text = children
          .map((c: any) => c.text || c.children?.map((tc: any) => tc.text).join('') || '')
          .join(' ')
          .trim()
        if (text) return text
      } catch (e) {
        // Fallthrough
      }
    }

    // Localized dictionary resolution
    const objectMatch =
      sanitize(rawVal[currentLocale]) ||
      sanitize(rawVal.ckb) ||
      sanitize(rawVal.en) ||
      sanitize(rawVal.ar) ||
      Object.values(rawVal)
        .map(sanitize)
        .find((v): v is string => v !== null)

    if (objectMatch) return objectMatch
  }

  // 4. Flattened top-level properties (e.g. title_ar, titleAr)
  const topLevelMatch =
    sanitize(product[`${fieldType}_${currentLocale}`]) ||
    sanitize(product[`${fieldType}_ckb`]) ||
    sanitize(product[`${fieldType}Ckb`]) ||
    sanitize(product[`${fieldType}_en`]) ||
    sanitize(product[`${fieldType}En`]) ||
    sanitize(product[`${fieldType}_ar`]) ||
    sanitize(product[`${fieldType}Ar`])

  if (topLevelMatch) return topLevelMatch

  // 5. Check candidate fallbacks (name, label, slug)
  const fallbackCandidates =
    sanitize(product.name) ||
    sanitize(product.productName) ||
    sanitize(product.label) ||
    sanitize(product.slug)

  if (fallbackCandidates) return fallbackCandidates

  // 6. UI-PRODUCT FIX: If this is a ui-product/case offer wrapping a linked product,
  // recursively search the linked product or uiCategory for the missing text!
  if (product.linkedProduct && typeof product.linkedProduct === 'object') {
    const linkedText = getFallbackText(product.linkedProduct, fieldType, currentLocale)
    if (linkedText) return linkedText
  }

  if (product.uiCategory && typeof product.uiCategory === 'object') {
    const categoryText = getFallbackText(product.uiCategory, fieldType, currentLocale)
    if (categoryText) return categoryText
  }

  if (product.category && typeof product.category === 'object') {
    const categoryText = getFallbackText(product.category, fieldType, currentLocale)
    if (categoryText) return categoryText
  }

  return ''
}
