import { fallbackCatalog } from './fallback_catalog'

export function getLocalizedProductTitle(product: any, currentLocale: string): string {
  if (!product) return ''

  // 1. Extract potential locale values from localized fields or top-level properties
  const titleObj = typeof product.title === 'object' ? product.title : {}

  const en =
    (typeof product.title === 'string' ? product.title : titleObj?.en) || product?.title_en || ''
  const ckb = titleObj?.ckb || product?.title_ckb || titleObj?.ku || product?.title_ku || ''
  const ar = titleObj?.ar || product?.title_ar || ''

  // 2. Resolve requested locale value
  let resolvedTitle = ''
  if (currentLocale === 'en') resolvedTitle = en
  else if (currentLocale === 'ckb' || currentLocale === 'ku') resolvedTitle = ckb
  else if (currentLocale === 'ar') resolvedTitle = ar

  // 3. Check fallback catalog if title is missing or if product.title key exists in catalog
  const rawKey = typeof product.title === 'string' ? product.title : en
  if (!resolvedTitle && rawKey && fallbackCatalog[rawKey]) {
    resolvedTitle = fallbackCatalog[rawKey][currentLocale as 'en' | 'ar' | 'ckb'] || ''
  }

  if (resolvedTitle && resolvedTitle.trim() !== '') {
    return resolvedTitle
  }

  // 4. Fallback hierarchy: Default to English, then CKB, then AR
  if (en && en.trim() !== '') return en
  if (ckb && ckb.trim() !== '') return ckb
  if (ar && ar.trim() !== '') return ar

  // 5. Check catalog English fallback
  if (rawKey && fallbackCatalog[rawKey]?.en) {
    return fallbackCatalog[rawKey].en
  }

  return product.name || product.slug || ''
}
