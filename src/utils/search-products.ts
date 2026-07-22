import { getPayload } from 'payload'
import config from '@/payload.config'

export interface MatchedProduct {
  id: string | number
  slug?: string
  price: number
  condition?: string
  category: string
  categorySlug: string // <-- Added categorySlug property
  featuredImage: any
  title: string
  descriptionSnippet: string
}

function resolveLocalizedField(field: any, currentLocale: string): string {
  if (typeof field !== 'object' || field === null) {
    return String(field ?? '')
  }
  return (
    field[currentLocale] ||
    field['ckb'] ||
    field['en'] ||
    field['ar'] ||
    Object.values(field)[0] ||
    ''
  )
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
    // fall through to empty string
  }
  return ''
}

function resolveCategory(doc: any, currentLocale: string): string {
  if (!doc.category) return ''

  if (typeof doc.category !== 'object') {
    return String(doc.category)
  }

  const rawCatTitle = doc.category.title || doc.category.name || ''
  return resolveLocalizedField(rawCatTitle, currentLocale)
}

function resolveCategorySlug(doc: any): string {
  if (!doc.category) return 'products'

  if (typeof doc.category === 'object' && doc.category !== null) {
    // Resolve slug if localized or plain string
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
 * Runs the cross-locale product search and maps the raw Payload docs into
 * the flat shape the search results page renders.
 */
export async function searchProducts(
  query: string,
  currentLocale: string,
): Promise<MatchedProduct[]> {
  if (!query) return []

  const payload = await getPayload({ config })

  const searchData = await payload.find({
    collection: 'products',
    // Query 'all' locales so Payload leaves the raw localized data structure intact.
    locale: 'all',
    where: {
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
    depth: 2,
    limit: 50,
  })

  const q = query.toLowerCase()

  return searchData.docs
    .map((doc: any): MatchedProduct => {
      const rawTitle = doc.title || doc.name || ''
      const displayTitle = resolveLocalizedField(rawTitle, currentLocale)

      const rawDescription =
        typeof doc.description === 'object' && doc.description !== null
          ? resolveLocalizedField(doc.description, currentLocale)
          : doc.description || ''

      // Extract product slug (or localized product slug if applicable)
      const productSlug =
        typeof doc.slug === 'object' && doc.slug !== null
          ? resolveLocalizedField(doc.slug, currentLocale)
          : doc.slug || String(doc.id)

      return {
        id: doc.id,
        slug: productSlug,
        price: doc.price,
        condition: doc.condition,
        category: resolveCategory(doc, currentLocale),
        categorySlug: resolveCategorySlug(doc), // <-- Extracted category slug
        featuredImage: doc.featuredImage,
        title: displayTitle,
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
