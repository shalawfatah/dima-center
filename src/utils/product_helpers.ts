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
 * 1. Requested Locale string or property (e.g., product.title_ckb or product.title)
 * 2. English fallback (e.g., product.title_en or product.title.en)
 * 3. Arabic fallback
 * 4. Rich Text / AST content (if present)
 * 5. Alternative candidate fields (name, productName, label)
 */
export function getFallbackText(
  product: ProductItem | any,
  fieldType: LocalizableField,
  currentLocale: string,
): string {
  if (!product) return ''

  // 1. Check direct localized properties like title_ckb, title_en, description_ar
  const langKey = currentLocale === 'ar' || currentLocale === 'ckb' ? currentLocale : 'en'
  const localizedKey = `${fieldType}_${langKey}`
  const directLocalizedProp = sanitizeString(product[localizedKey])
  if (directLocalizedProp) {
    return directLocalizedProp
  }

  // 2. Fetch target field or alternative name candidates
  const rawVal = product[fieldType] ?? product.name ?? product.productName ?? product.label

  // 3. Direct non-empty string
  const directString = sanitizeString(rawVal)
  if (directString) {
    return directString
  }

  // 4. Handle localized objects or Rich Text ASTs
  if (typeof rawVal === 'object' && rawVal !== null) {
    // Rich Text field handling (Lexical / Slate AST)
    if (rawVal.root || Array.isArray(rawVal.children)) {
      try {
        const children = rawVal.root?.children || rawVal.children || []
        const text = children
          .map((c: any) => c.text || c.children?.map((tc: any) => tc.text).join('') || '')
          .join(' ')
          .trim()
        if (text) return text
      } catch (e) {
        // Fallthrough to object checking
      }
    }

    // Localized dictionary fallback sequence: Requested Locale -> English -> Arabic -> Kurdish -> Any non-empty string
    const localizedStr =
      sanitizeString(rawVal[currentLocale]) ||
      sanitizeString(rawVal.en) ||
      sanitizeString(rawVal.ar) ||
      sanitizeString(rawVal.ckb) ||
      Object.values(rawVal).map(sanitizeString).find(Boolean)

    if (localizedStr) {
      return localizedStr
    }
  }

  // 5. Explicit fallback checks across English properties if everything above was empty
  const explicitEnFallback =
    sanitizeString(product[`${fieldType}_en`]) ||
    sanitizeString(product.title_en) ||
    sanitizeString(product.name) ||
    sanitizeString(product.productName) ||
    sanitizeString(product.label)

  if (explicitEnFallback) {
    return explicitEnFallback
  }

  return ''
}
