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
 * Resolves localized fields with strict fallback: Requested -> EN -> CKB -> AR
 */
function resolveLocalizedField(field: any, currentLocale: string, fallbackDoc?: any): string {
  if (typeof field === 'string' || typeof field === 'number') {
    return String(field)
  }

  // 1. Standard localized object resolution
  if (typeof field === 'object' && field !== null) {
    const requested = field[currentLocale]
    if (requested && typeof requested === 'string' && requested.trim().length > 0) {
      return String(requested)
    }

    // Fallback hierarchy: EN -> CKB -> AR
    const en = field['en']
    if (en && typeof en === 'string' && en.trim().length > 0) return String(en)

    const ckb = field['ckb'] || field['ku']
    if (ckb && typeof ckb === 'string' && ckb.trim().length > 0) return String(ckb)

    const ar = field['ar']
    if (ar && typeof ar === 'string' && ar.trim().length > 0) return String(ar)

    const anyVal = Object.values(field).find(
      (val) => typeof val === 'string' && val.trim().length > 0,
    )
    if (anyVal) return String(anyVal)
  }

  // 2. Payload _locales array fallback
  if (fallbackDoc && Array.isArray(fallbackDoc._locales)) {
    const findLocale = (loc: string) =>
      fallbackDoc._locales.find(
        (l: any) => l._locale === loc && l.title && String(l.title).trim() !== '',
      )

    const entry =
      findLocale(currentLocale) ||
      findLocale('en') ||
      findLocale('ckb') ||
      findLocale('ku') ||
      findLocale('ar') ||
      fallbackDoc._locales[0]

    if (entry && entry.title) {
      return String(entry.title)
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
    // Return empty on parse error
  }
  return ''
}

function resolveCategory(doc: any, currentLocale: string): string {
  if (!doc.category) return ''
  if (typeof doc.category !== 'object') return String(doc.category)

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
