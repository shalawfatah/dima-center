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

  // Fallback to typography directly if props aren't explicitly passed
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
        fallbackLocale: 'en', // 👈 Change from 'ckb' to 'en'
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
        fallbackLocale: 'en', // 👈 Change from 'ckb' to 'en'
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
    const slug = (p as any).category?.slug || (p as any).uiCategory?.slug
    if (!slug) continue
    if (!bySlug[slug]) bySlug[slug] = []
    bySlug[slug].push(p)
  }

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
      {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}

      {homepageSections.map((cat) => (
        <section key={cat.slug} className={styles.section}>
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
      ))}
    </>
  )
}
