import { getPayload } from 'payload'
import config from '@/payload.config'

export interface MatchedProduct {
  id: string | number
  slug?: string
  price: number
  condition?: string
  category: string
  categorySlug: string
  featuredImage: any
  title: string
  descriptionSnippet: string
}

/**
 * Resolves localized fields, including support for standard localized objects
 * and Payload's internal `_locales` fallback array for complex field schemas.
 */
function resolveLocalizedField(field: any, currentLocale: string, fallbackDoc?: any): string {
  // 1. Direct string/number output
  if (typeof field === 'string' || typeof field === 'number') {
    return String(field)
  }

  // 2. Standard localized object: { en: 'Title', ckb: '...', ar: '...' }
  if (typeof field === 'object' && field !== null) {
    const value =
      field[currentLocale] ||
      field['ckb'] ||
      field['en'] ||
      field['ar'] ||
      Object.values(field).find((val) => typeof val === 'string' && val.trim().length > 0)

    if (value) return String(value)
  }

  // 3. Fallback for Payload's internal _locales array (frequently used in complex blocks/specs)
  if (fallbackDoc && Array.isArray(fallbackDoc._locales)) {
    const localeEntry =
      fallbackDoc._locales.find((l: any) => l._locale === currentLocale) ||
      fallbackDoc._locales.find((l: any) => l._locale === 'ckb') ||
      fallbackDoc._locales.find((l: any) => l._locale === 'en') ||
      fallbackDoc._locales.find((l: any) => l._locale === 'ar') ||
      fallbackDoc._locales[0]

    if (localeEntry && localeEntry.title) {
      return String(localeEntry.title)
    }
  }

  return ''
}

function extractDescriptionSnippet(rawDescription: any): string {
  try {
    if (typeof rawDescription === 'string') {
      return rawDescription
    }
    if (rawDescription?.root?.children) {
      return rawDescription.root.children
        .map((ch: any) => ch.children?.map((g: any) => g.text).join('') || '')
        .join(' ')
    }
  } catch {
    // Fall back to empty string if parsing fails
  }
  return ''
}

function resolveCategory(doc: any, currentLocale: string): string {
  if (!doc.category) return ''

  if (typeof doc.category !== 'object') {
    return String(doc.category)
  }

  const rawCatTitle = doc.category.title || doc.category.name || ''
  return resolveLocalizedField(rawCatTitle, currentLocale, doc.category)
}

function resolveCategorySlug(doc: any): string {
  if (!doc.category) return 'products'

  if (typeof doc.category === 'object' && doc.category !== null) {
    if (typeof doc.category.slug === 'object' && doc.category.slug !== null) {
      return (
        doc.category.slug.en ||
        doc.category.slug.ckb ||
        doc.category.slug.ar ||
        Object.values(doc.category.slug)[0] ||
        'products'
      )
    }
    return doc.category.slug || 'products'
  }

  return 'products'
}

/**
 * Runs cross-locale product search and normalizes title resolution across all locales.
 */
export async function searchProducts(
  query: string,
  currentLocale: string,
): Promise<MatchedProduct[]> {
  if (!query) return []

  const payload = await getPayload({ config })

  const searchData = await payload.find({
    collection: 'products',
    locale: 'all',
    where: {
      and: [
        { stock: { greater_than: 0 } },
        { hideOnWebsite: { not_equals: true } },
        {
          or: [
            { 'title.en': { contains: query } },
            { 'title.ar': { contains: query } },
            { 'title.ckb': { contains: query } },
            { 'description.en': { contains: query } },
            { 'description.ar': { contains: query } },
            { 'description.ckb': { contains: query } },
            { 'category.title.en': { contains: query } },
            { 'category.title.ar': { contains: query } },
            { 'category.title.ckb': { contains: query } },
            { 'category.slug': { contains: query } },
          ],
        },
      ],
    },
    depth: 2,
    limit: 50,
  })

  const q = query.toLowerCase()

  return searchData.docs
    .map((doc: any): MatchedProduct => {
      const rawTitle = doc.title || doc.name || ''
      const displayTitle = resolveLocalizedField(rawTitle, currentLocale, doc)

      const rawDescription =
        typeof doc.description === 'object' && doc.description !== null
          ? resolveLocalizedField(doc.description, currentLocale, doc)
          : doc.description || ''

      const productSlug =
        typeof doc.slug === 'object' && doc.slug !== null
          ? resolveLocalizedField(doc.slug, currentLocale, doc)
          : doc.slug || String(doc.id)

      return {
        id: doc.id,
        slug: productSlug || String(doc.id),
        price: doc.price,
        condition: doc.condition,
        category: resolveCategory(doc, currentLocale),
        categorySlug: resolveCategorySlug(doc),
        featuredImage: doc.featuredImage,
        title: displayTitle || 'Untitled Product',
        descriptionSnippet: extractDescriptionSnippet(rawDescription),
      }
    })
    .sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()

      if (aTitle.startsWith(q) && !bTitle.startsWith(q)) return -1
      if (bTitle.startsWith(q) && !aTitle.startsWith(q)) return 1
      return 0
    })
}
