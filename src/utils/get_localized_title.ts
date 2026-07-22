import { fallbackCatalog } from './fallback_catalog'

export function getLocalizedProductTitle(product: any, currentLocale: string): string {
  if (!product) return ''
  const rawTitle = product.title || ''
  if (fallbackCatalog[rawTitle]) {
    return fallbackCatalog[rawTitle][currentLocale as 'en' | 'ar' | 'ckb'] || rawTitle
  }
  return rawTitle
}
