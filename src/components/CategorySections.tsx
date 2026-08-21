import { getPayload } from 'payload'
import config from '@/payload.config'
import ProductCarousel from '@/components/ProductCarousel'
import LocalizedHeading from '@/components/LocalizedHeading'
import { formatProductForCarousel, buildDynamicSectionMetaMapping } from '@/utils/homepage-helpers'
import { ProductItem } from '@/types/types'
import styles from '@/styles/homepage.module.css'
import Link from 'next/link'

const PER_SECTION_LIMIT = 20

// Localized "See All" button text mapping
const SEE_ALL_TEXT: Record<string, string> = {
  ckb: 'هەموویان ببینە',
  ar: 'عرض الكل',
  en: 'See All',
}

/**
 * Helper to get string slug regardless of whether Payload returns an object or raw string ID
 */
function getSlugValue(rel: any): string | undefined {
  if (!rel) return undefined
  if (typeof rel === 'string') return rel // If unpopulated ID or string slug
  return rel.slug || rel.id || undefined
}

/**
 * Helper to interleave products across subcategories round-robin
 * so that no single subcategory hogs the section capacity.
 */
function interleaveSubcategories(bySlug: Record<string, any[]>, leafSlugs: string[]): any[] {
  const queues = leafSlugs.map((slug) => bySlug[slug] || []).filter((list) => list.length > 0)

  if (queues.length === 0) return []
  if (queues.length === 1) return queues[0]

  const result: any[] = []
  let addedAny = true
  let index = 0

  while (addedAny) {
    addedAny = false
    for (const queue of queues) {
      if (index < queue.length) {
        result.push(queue[index])
        addedAny = true
      }
    }
    index++
  }

  return result
}

export default async function CategorySections({
  currentLocale,
  isRtl,
  generalSettings,
  headingFont,
  bodyFont,
  dynamicFontFaceCSS,
  titleColor,
  bodyColor,
  boxTitleColor,
  boxBodyColor,
  boxPriceColor,
}: {
  currentLocale: string
  isRtl: boolean
  generalSettings?: any
  headingFont?: string
  bodyFont?: string
  dynamicFontFaceCSS?: string
  titleColor?: string
  bodyColor?: string
  boxTitleColor?: string
  boxBodyColor?: string
  boxPriceColor?: string
}) {
  const payload = await getPayload({ config })

  const uiCategoriesResult = await payload
    .find({
      collection: 'ui-categories',
      depth: 1,
      limit: 100,
      sort: 'order',
      locale: currentLocale as 'en' | 'ckb' | 'ar',
      fallbackLocale: 'ckb',
    })
    .catch((err) => {
      console.error('Failed to fetch ui-categories', err)
      return { docs: [] }
    })

  const typography = generalSettings?.typography
  const boxBgColor = typography?.boxBackgroundColor || undefined

  const resolvedBoxTitleColor = boxTitleColor ?? typography?.boxTitleColor ?? undefined
  const resolvedBoxBodyColor = boxBodyColor ?? typography?.boxBodyColor ?? undefined
  const resolvedBoxPriceColor = boxPriceColor ?? typography?.boxPriceColor ?? undefined

  if (!uiCategoriesResult.docs.length) return null

  const sectionMetaMapping = buildDynamicSectionMetaMapping(uiCategoriesResult.docs)
  const allLeafSlugs = Array.from(new Set(sectionMetaMapping.flatMap((s) => s.leafSlugs)))

  if (allLeafSlugs.length === 0) return null

  const [productsBulk, uiProductsBulk] = await Promise.all([
    payload
      .find({
        collection: 'products',
        depth: 1,
        locale: currentLocale as 'en' | 'ar' | 'ckb',
        fallbackLocale: 'en',
        where: {
          and: [
            { 'category.slug': { in: allLeafSlugs } },
            { stock: { greater_than: 0 } },
            { hideOnWebsite: { not_equals: true } },
          ],
        },
        limit: 2000,
        sort: '-createdAt',
      })
      .catch(() => ({ docs: [] as any[] })),

    payload
      .find({
        collection: 'ui-products',
        depth: 1,
        locale: currentLocale as 'en' | 'ar' | 'ckb',
        fallbackLocale: 'en',
        where: {
          or: [
            { 'category.slug': { in: allLeafSlugs } },
            { 'uiCategory.slug': { in: allLeafSlugs } },
          ],
        },
        limit: 2000,
        sort: '-createdAt',
      })
      .catch(() => ({ docs: [] as any[] })),
  ])

  const bySlug: Record<string, any[]> = {}
  const allDocs = [...productsBulk.docs, ...uiProductsBulk.docs]

  for (const p of allDocs) {
    const slug = getSlugValue((p as any).category) || getSlugValue((p as any).uiCategory)
    if (!slug) continue
    if (!bySlug[slug]) bySlug[slug] = []
    bySlug[slug].push(p)
  }

  const homepageSections = sectionMetaMapping
    .map((meta) => {
      const interleavedDocs = interleaveSubcategories(bySlug, meta.leafSlugs)

      const formattedProducts = interleavedDocs
        .map((p: any) => formatProductForCarousel(p, currentLocale))
        .filter((p): p is ProductItem => Boolean(p))

      return { ...meta, products: formattedProducts.slice(0, PER_SECTION_LIMIT) }
    })
    .filter((s) => s.products.length > 0)

  if (homepageSections.length === 0) return null

  const seeAllText = SEE_ALL_TEXT[currentLocale] || SEE_ALL_TEXT.en

  return (
    <>
      {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}

      {homepageSections.map((cat, idx) => {
        const rawSlug = typeof cat.slug === 'object' ? (cat.slug as any)?.slug : cat.slug
        const categorySlug = String(rawSlug || `section-${idx}`)
        const targetUrl = `?category=${encodeURIComponent(categorySlug)}`

        // Key combines the category slug with loop index to guarantee uniqueness
        const sectionKey = `${categorySlug}-${idx}`

        return (
          <section key={sectionKey} className={styles.section}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: isRtl ? 'row-reverse' : 'row',
                alignItems: 'center',
              }}
            >
              <LocalizedHeading
                currentLocale={currentLocale}
                en={cat.title.en}
                ar={cat.title.ar}
                ckb={cat.title.ckb}
                headingFont={headingFont}
                style={{
                  fontSize: '1.4rem',
                  marginBottom: '0.5rem',
                }}
              />
              {cat.slug.length > 2 && (
                <Link href={targetUrl} style={{ fontFamily: headingFont }}>
                  {seeAllText}
                </Link>
              )}
            </div>
            <ProductCarousel
              isRtl={isRtl}
              currentLocale={currentLocale}
              products={cat.products}
              cardBgColor={boxBgColor}
              headingFont={headingFont}
              bodyFont={bodyFont}
              boxBorderColor={generalSettings?.typography?.boxBorderColor}
              titleColor={titleColor}
              bodyColor={bodyColor}
              boxTitleColor={resolvedBoxTitleColor}
              boxBodyColor={resolvedBoxBodyColor}
              boxPriceColor={resolvedBoxPriceColor}
            />
          </section>
        )
      })}
    </>
  )
}
