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

/**
 * 🎯 Helper to extract specific leaf subcategory key for accurate interleaving
 */
function getCategoryKey(product: ProductItem): string {
  if (typeof product.category === 'object' && product.category !== null) {
    const cat = product.category as any
    if (cat.slug) return String(cat.slug)
    if (cat.id) return String(cat.id)
  }
  if (typeof product.uiCategory === 'object' && product.uiCategory !== null) {
    const uiCat = product.uiCategory as any
    if (uiCat.slug) return String(uiCat.slug)
    if (uiCat.id) return String(uiCat.id)
  }
  if (typeof product.category === 'string') {
    return product.category
  }
  return 'uncategorized'
}

/**
 * 🎯 Round-Robin Interleaving
 * Distributes items evenly across different subcategories/categories.
 */
function interleaveBySubcategory(products: ProductItem[]): ProductItem[] {
  if (!products || products.length === 0) return []

  const categoryGroups: Record<string, ProductItem[]> = {}
  for (const product of products) {
    const key = getCategoryKey(product)
    if (!categoryGroups[key]) {
      categoryGroups[key] = []
    }
    categoryGroups[key].push(product)
  }

  const groupKeys = Object.keys(categoryGroups)
  if (groupKeys.length <= 1) return products

  const result: ProductItem[] = []
  let addedAny = true
  let index = 0

  while (addedAny) {
    addedAny = false
    for (const key of groupKeys) {
      if (index < categoryGroups[key].length) {
        result.push(categoryGroups[key][index])
        addedAny = true
      }
    }
    index++
  }

  return result
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

  const interleavedDefault = interleaveBySubcategory(defaultProducts)
  const interleavedDiscounted = interleaveBySubcategory(discountedProducts)

  return [...manualOffers, ...interleavedDiscounted, ...monitorProducts, ...interleavedDefault]
}

type LocalizableField = 'title' | 'description'

export function getFallbackText(
  product: ProductItem | any,
  fieldType: LocalizableField,
  currentLocale: string,
): string {
  if (!product) return ''

  const sanitize = (val: any): string | null => {
    if (typeof val === 'string' && val.trim() !== '') return val.trim()
    return null
  }

  const rawVal = product[fieldType]

  const directStr = sanitize(rawVal)
  if (directStr) return directStr

  if (typeof rawVal === 'object' && rawVal !== null) {
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

  const topLevelMatch =
    sanitize(product[`${fieldType}_${currentLocale}`]) ||
    sanitize(product[`${fieldType}_ckb`]) ||
    sanitize(product[`${fieldType}Ckb`]) ||
    sanitize(product[`${fieldType}_en`]) ||
    sanitize(product[`${fieldType}En`]) ||
    sanitize(product[`${fieldType}_ar`]) ||
    sanitize(product[`${fieldType}Ar`])

  if (topLevelMatch) return topLevelMatch

  const fallbackCandidates =
    sanitize(product.name) ||
    sanitize(product.productName) ||
    sanitize(product.label) ||
    sanitize(product.slug)

  if (fallbackCandidates) return fallbackCandidates

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
