// CategorySections.tsx

import { getPayload } from 'payload'
import config from '@/payload.config'
import ProductCarousel from '@/components/ProductCarousel'
import LocalizedHeading from '@/components/LocalizedHeading'
import { formatProductForCarousel, buildDynamicSectionMetaMapping } from '@/utils/homepage-helpers'
import { ProductItem } from '@/types/types'
import styles from '@/styles/homepage.module.css'

const PER_SECTION_LIMIT = 20

export default async function CategorySections({
  currentLocale,
  isRtl,
}: {
  currentLocale: string
  isRtl: boolean
}) {
  const payload = await getPayload({ config })

  // 1. Fetch dynamic UI Categories sorted by admin 'order'
  const uiCategoriesResult = await payload
    .find({
      collection: 'ui-categories',
      limit: 100,
      sort: 'order',
      locale: currentLocale as 'en' | 'ar' | 'ckb',
      fallbackLocale: 'en', // 🎯 Ensures UI Category titles fall back to English
    })
    .catch((err) => {
      console.error('Failed to fetch ui-categories', err)
      return { docs: [] }
    })

  if (!uiCategoriesResult.docs.length) return null

  // 2. Build map of section metadata
  const sectionMetaMapping = buildDynamicSectionMetaMapping(uiCategoriesResult.docs)
  const allLeafSlugs = Array.from(new Set(sectionMetaMapping.flatMap((s) => s.leafSlugs)))

  if (allLeafSlugs.length === 0) return null

  // 3. Query BOTH 'products' AND 'ui-products' with explicit fallbackLocale: 'en'
  const [productsBulk, uiProductsBulk] = await Promise.all([
    payload
      .find({
        collection: 'products',
        depth: 1,
        locale: currentLocale as 'en' | 'ar' | 'ckb',
        fallbackLocale: 'en', // 🎯 Payload will return English if CKB is missing
        where: {
          and: [{ 'category.slug': { in: allLeafSlugs } }, { stock: { greater_than: 0 } }],
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
        fallbackLocale: 'en', // 🎯 Payload will return English if CKB is missing
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

  // 4. Group all retrieved products by category slug
  const bySlug: Record<string, any[]> = {}
  const allDocs = [...productsBulk.docs, ...uiProductsBulk.docs]

  for (const p of allDocs) {
    const slug = (p as any).category?.slug || (p as any).uiCategory?.slug
    if (!slug) continue
    if (!bySlug[slug]) bySlug[slug] = []
    bySlug[slug].push(p)
  }

  // 5. Combine products for each section matching ui-categories admin order
  const homepageSections = sectionMetaMapping
    .map((meta) => {
      const merged = meta.leafSlugs.flatMap((slug) => bySlug[slug] || [])
      const formattedProducts = merged
        .map((p: any) => formatProductForCarousel(p, currentLocale))
        .filter((p): p is ProductItem => Boolean(p))

      return { ...meta, products: formattedProducts.slice(0, PER_SECTION_LIMIT) }
    })
    .filter((s) => s.products.length > 0)

  if (homepageSections.length === 0) return null

  return (
    <>
      {homepageSections.map((cat) => (
        <section key={cat.slug} className={styles.section}>
          <LocalizedHeading
            currentLocale={currentLocale}
            en={cat.title.en}
            ar={cat.title.ar}
            ckb={cat.title.ckb}
            style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}
          />
          <ProductCarousel isRtl={isRtl} currentLocale={currentLocale} products={cat.products} />
        </section>
      ))}
    </>
  )
}
