// @/utils/homepage-helpers.ts

import { ProductItem } from '@/types/types'

export interface SectionMeta {
  slug: string
  leafSlugs: string[]
  title: {
    en: string
    ar: string
    ckb: string
  }
}

// Select minimal fields needed from Payload documents
export const MINIMAL_PRODUCT_FIELDS = {
  id: true,
  title: true,
  name: true,
  productName: true,
  label: true,
  title_en: true,
  price: true,
  salePrice: true,
  featuredImage: true,
  image: true,
  imagesGallery: true,
  category: true,
  uiCategory: true,
  stock: true,
  createdAt: true,
} as const

// Safe helper to extract image URL regardless of relationship population shape
function getImageUrl(mediaField: any): string | null {
  if (!mediaField) return null
  if (typeof mediaField === 'string') return mediaField // Direct URL or string ID
  if (typeof mediaField === 'object' && mediaField.url) return mediaField.url
  return null
}

/**
 * 🎯 Robust Title Resolver with Multi-Locale Fallback
 * Priority order for requested locale (e.g., 'ckb'):
 * 1. Requested Locale -> 2. English ('en') -> 3. Arabic ('ar') -> 4. Any Non-Empty String
 */
export function resolveAnyTitle(product: any, locale: string = 'en'): string {
  if (!product) return ''

  // Search across possible title field names Payload CMS schemas use
  const rawTitle =
    product.title ?? product.name ?? product.productName ?? product.label ?? product.title_en ?? ''

  // 1. Direct String
  if (typeof rawTitle === 'string' && rawTitle.trim() !== '') {
    return rawTitle
  }

  // 2. Localized Object or Rich Text AST
  if (typeof rawTitle === 'object' && rawTitle !== null) {
    // Check for Lexical / Slate Rich Text AST structures
    if (rawTitle.root || Array.isArray(rawTitle.children)) {
      try {
        const children = rawTitle.root?.children || rawTitle.children || []
        const text = children
          .map((c: any) => c.text || c.children?.map((tc: any) => tc.text).join('') || '')
          .join(' ')
          .trim()
        if (text) return text
      } catch (e) {
        // Fallback
      }
    }

    // Localized Dictionary with Cascading Fallbacks: [Requested Locale] -> [en] -> [ar] -> [ckb] -> Any Valid String
    const localizedStr =
      (typeof rawTitle[locale] === 'string' && rawTitle[locale].trim() !== ''
        ? rawTitle[locale]
        : null) ||
      (typeof rawTitle.en === 'string' && rawTitle.en.trim() !== '' ? rawTitle.en : null) ||
      (typeof rawTitle.ar === 'string' && rawTitle.ar.trim() !== '' ? rawTitle.ar : null) ||
      (typeof rawTitle.ckb === 'string' && rawTitle.ckb.trim() !== '' ? rawTitle.ckb : null) ||
      Object.values(rawTitle).find((v) => typeof v === 'string' && v.trim() !== '')

    if (typeof localizedStr === 'string' && localizedStr.trim() !== '') {
      return localizedStr
    }
  }

  return ''
}

export function formatProductForCarousel(product: any, currentLocale: string): ProductItem | null {
  if (!product) return null

  // 🎯 Resolves title with explicit fallback to 'en' if 'ckb' or current locale is empty
  const title = resolveAnyTitle(product, currentLocale)

  // Extract image in order of schema priority
  let imageUrl = getImageUrl(product.image)

  if (!imageUrl && product.featuredImage) {
    imageUrl = getImageUrl(product.featuredImage)
  }

  if (!imageUrl && product.imagesGallery?.length) {
    const galleryItem = product.imagesGallery[0]?.image || product.imagesGallery[0]
    imageUrl = getImageUrl(galleryItem)
  }

  return {
    ...product,
    id: product.id,
    title,
    price: product.price ?? 0,
    salePrice: product.salePrice ?? null,
    image: imageUrl || '/placeholder.png',
    stock: product.stock ?? 0,
    uiCategory: product.uiCategory ?? null,
    category: product.category ?? null,
    linkType: product.linkType,
    staticUrl: product.staticUrl,
    linkedProduct: product.linkedProduct,
    isCaseOffer: product.isCaseOffer,
  } as ProductItem
}

export function buildDynamicSectionMetaMapping(uiCategoryDocs: any[]): SectionMeta[] {
  const sectionMetaMapping: SectionMeta[] = []

  for (const group of uiCategoryDocs) {
    if (group.hideInCarousel) continue

    const getLocalizedTitle = (
      obj: any,
      fallback = '',
    ): { en: string; ar: string; ckb: string } => {
      if (!obj) return { en: fallback, ar: fallback, ckb: fallback }
      if (typeof obj === 'string') return { en: obj, ar: obj, ckb: obj }

      const en = obj.en || fallback
      const ar = obj.ar || en || fallback
      const ckb = obj.ckb || en || ar || fallback

      return { en, ar, ckb }
    }

    const groupTitles = getLocalizedTitle(group.title)
    const englishTitle = groupTitles.en.toLowerCase()

    const isComputerParts =
      englishTitle.includes('computer parts') || englishTitle.includes('parts')

    if (isComputerParts && group.subCategories?.length) {
      for (const sub of group.subCategories) {
        const subTitles = getLocalizedTitle(sub.title, sub.slug)
        sectionMetaMapping.push({
          slug: sub.slug,
          leafSlugs: [sub.slug],
          title: subTitles,
        })
      }
    } else if (group.slug && !group.isContainer) {
      sectionMetaMapping.push({
        slug: group.slug,
        leafSlugs: [group.slug],
        title: groupTitles,
      })
    } else if (group.isContainer && group.subCategories?.length) {
      const subSlugs = group.subCategories.map((sub: any) => sub.slug).filter(Boolean)
      if (subSlugs.length > 0) {
        sectionMetaMapping.push({
          slug: group.id || `group-${group.slug || 'container'}`,
          leafSlugs: subSlugs,
          title: groupTitles,
        })
      }
    }
  }

  return sectionMetaMapping
}
