import { getPayload } from 'payload'
import config from '@/payload.config'
import ProductCarousel from '@/components/ProductCarousel'
import LocalizedHeading from '@/components/LocalizedHeading'
import { MAIN_CATEGORY_GROUPS } from '@/utils/categories'
import {
  MINIMAL_PRODUCT_FIELDS,
  formatProductForCarousel,
  buildSectionMetaMapping,
} from '@/utils/homepage-helpers'
import styles from '@/styles/homepage.module.css' // adjust if your page.module.css lives elsewhere

const PER_SECTION_LIMIT = 20

export default async function CategorySections({
  currentLocale,
  isRtl,
}: {
  currentLocale: string
  isRtl: boolean
}) {
  const payload = await getPayload({ config })

  const majorGroupsEn = MAIN_CATEGORY_GROUPS['en'] || []
  const majorGroupsAr = MAIN_CATEGORY_GROUPS['ar'] || []
  const majorGroupsCkb = MAIN_CATEGORY_GROUPS['ckb'] || []

  const sectionMetaMapping = buildSectionMetaMapping(majorGroupsEn, majorGroupsAr, majorGroupsCkb)

  // Every leaf category slug we need products for, deduplicated — this is
  // what turns "1 query per category" into "1 query total".
  const allLeafSlugs = Array.from(new Set(sectionMetaMapping.flatMap((s) => s.leafSlugs)))

  if (allLeafSlugs.length === 0) return null

  const bulk = await payload
    .find({
      collection: 'products',
      depth: 1,
      select: MINIMAL_PRODUCT_FIELDS,
      where: {
        and: [{ 'category.slug': { in: allLeafSlugs } }, { stock: { greater_than: 0 } }],
      },
      // Ceiling across ALL categories combined, not per-category. Raise this
      // if you have many categories with >20 in-stock items each and you're
      // seeing sections come up short — see note below.
      limit: 2000,
      sort: '-createdAt',
    })
    .catch((err) => {
      console.error('Failed to batch-fetch category sections', err)
      return { docs: [] as any[] }
    })

  // Bucket products by their actual category slug, respecting the
  // per-section display limit.
  const bySlug: Record<string, any[]> = {}
  for (const p of bulk.docs) {
    const slug = (p as any).category?.slug
    if (!slug) continue
    if (!bySlug[slug]) bySlug[slug] = []
    bySlug[slug].push(p)
  }

  const homepageSections = sectionMetaMapping
    .map((meta) => {
      // Merge products across every leaf slug this section covers (handles
      // both single-category sections and grouped ones), then cap.
      const merged = meta.leafSlugs.flatMap((slug) => bySlug[slug] || [])
      return { ...meta, products: merged.slice(0, PER_SECTION_LIMIT) }
    })
    .filter((s) => s.products.length > 0)

  const sortedSections = homepageSections.sort((a, b) => {
    const aIsMonitor = a.slug === 'monitor'
    const bIsMonitor = b.slug === 'monitor'
    if (aIsMonitor && !bIsMonitor) return -1
    if (!aIsMonitor && bIsMonitor) return 1
    return 0
  })

  if (sortedSections.length === 0) return null

  return (
    <>
      {sortedSections.map((cat) => (
        <section key={cat.slug} className={styles.section}>
          <LocalizedHeading
            currentLocale={currentLocale}
            en={cat.en}
            ar={cat.ar}
            ckb={cat.ckb}
            style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}
          />
          <ProductCarousel
            isRtl={isRtl}
            currentLocale={currentLocale}
            products={cat.products.map((p: any) => formatProductForCarousel(p, currentLocale))}
          />
        </section>
      ))}
    </>
  )
}
