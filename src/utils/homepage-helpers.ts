// ✅ FIXED: Payload CMS v3 select property requires an explicit key-boolean map shape
export const MINIMAL_PRODUCT_FIELDS = {
  id: true,
  title: true,
  price: true,
  stock: true,
  featuredImage: true,
  hasDiscount: true,
  discountedPrice: true,
  category: true,
} as const

// --- Dynamic Routing Link Generator ---
export function resolveProductHref(locale: string, id: string | number, isCaseOffer: boolean) {
  const routeSegment = isCaseOffer ? 'case-offers' : 'products'
  return `/${locale}/${routeSegment}/${id}`
}

export function formatProductForCarousel(p: any, locale: string) {
  const isImageObj = p.featuredImage && typeof p.featuredImage === 'object' && p.featuredImage.url
  const productId = String(p.id)
  return {
    ...p,
    id: productId,
    featuredImage: isImageObj ? { url: p.featuredImage.url, alt: p.featuredImage.alt || '' } : null,
    isCaseOffer: false,
    href: resolveProductHref(locale, productId, false),
  }
}

export function formatCaseOfferForCarousel(offer: any, locale: string) {
  const isImageObj =
    offer.featured_image && typeof offer.featured_image === 'object' && offer.featured_image.url

  let rawUrl = isImageObj ? offer.featured_image.url : null
  if (rawUrl && rawUrl.includes(' ')) {
    rawUrl = rawUrl.replace(/ /g, '%20')
  }

  const originalPrice = Number(offer.price)
  const promoPrice = offer.discountedPrice ? Number(offer.discountedPrice) : null
  const hasPromo = !!promoPrice && promoPrice < originalPrice
  const discountAmount = hasPromo ? originalPrice - promoPrice : 0
  const offerId = String(offer.id)

  return {
    id: offerId,
    title: offer.title,
    featuredImage: rawUrl ? { url: rawUrl, alt: offer.featured_image.alt || offer.title } : null,
    price: originalPrice,
    hasDiscount: hasPromo,
    discountType: 'fixed' as const,
    discountValue: discountAmount,
    discountedPrice: promoPrice,
    isCaseOffer: true,
    href: resolveProductHref(locale, offerId, true),
  }
}

// --- Helper: Flatten categories dynamically for active filtering searches ---
export function getFlatCategories(groups: any[]): { title: string; slug: string }[] {
  const list: { title: string; slug: string }[] = []

  groups.forEach((group) => {
    if (group.slug) {
      list.push({ title: group.title, slug: group.slug })
    } else if (group.subCategories) {
      group.subCategories.forEach((sub: any) => {
        list.push({ title: sub.title, slug: sub.slug })
      })
    }
  })
  return list
}

export interface SectionMeta {
  slug: string
  // The actual product-category slug(s) to pull products from. For most
  // sections this is just [slug]. For a group with subCategories but no
  // slug of its own, it's every child slug — products across all of them
  // get merged into this one section.
  leafSlugs: string[]
  en: string
  ar: string
  ckb: string
}

// Builds the list of "buckets" we need to fill (one per category / subcategory),
// without hitting the DB — this is pure metadata prep so CategorySections
// can do a single batched query afterward.
export function buildSectionMetaMapping(
  majorGroupsEn: any[],
  majorGroupsAr: any[],
  majorGroupsCkb: any[],
): SectionMeta[] {
  const sectionMetaMapping: SectionMeta[] = []

  for (let idx = 0; idx < majorGroupsEn.length; idx++) {
    const group = majorGroupsEn[idx]
    const groupAr = majorGroupsAr[idx]
    const groupCkb = majorGroupsCkb[idx]

    const isComputerParts =
      group.title.toLowerCase().includes('computer parts') ||
      group.title.toLowerCase().includes('parts')
    const isMonitor = group.slug && group.slug.toLowerCase() === 'monitor'

    if (isMonitor) {
      sectionMetaMapping.push({
        slug: 'monitor',
        leafSlugs: ['monitor'],
        en: group.title,
        ar: groupAr?.title || group.title,
        ckb: groupCkb?.title || group.title,
      })
    } else if (isComputerParts && group.subCategories) {
      for (let subIdx = 0; subIdx < group.subCategories.length; subIdx++) {
        const subEn = group.subCategories[subIdx]
        const subAr = groupAr?.subCategories?.[subIdx]
        const subCkb = groupCkb?.subCategories?.[subIdx]

        sectionMetaMapping.push({
          slug: subEn.slug,
          leafSlugs: [subEn.slug],
          en: subEn.title,
          ar: subAr?.title || subEn.title,
          ckb: subCkb?.title || subEn.title,
        })
      }
    } else if (group.slug) {
      sectionMetaMapping.push({
        slug: group.slug,
        leafSlugs: [group.slug],
        en: group.title,
        ar: groupAr?.title || group.title,
        ckb: groupCkb?.title || group.title,
      })
    } else if (group.subCategories) {
      // Grouped section with no single slug of its own — its products come
      // from all its child slugs, merged into one section.
      const subSlugs = group.subCategories.map((sub: any) => sub.slug)
      sectionMetaMapping.push({
        slug: `group-${idx}`,
        leafSlugs: subSlugs,
        en: group.title,
        ar: groupAr?.title || group.title,
        ckb: groupCkb?.title || group.title,
      })
    }
  }

  return sectionMetaMapping
}
