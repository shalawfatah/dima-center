import { getPayload } from 'payload'
import config from '@/payload.config'
import { calculateProductPrice } from '@/utils/price'
import ProductCarousel from '@/components/ProductCarousel'
import LocalizedHeading from '@/components/LocalizedHeading'
import { MINIMAL_PRODUCT_FIELDS, formatProductForCarousel } from '@/utils/homepage-helpers'
import styles from '@/styles/homepage.module.css' // adjust if your page.module.css lives elsewhere

export default async function DiscountsSection({
  currentLocale,
  isRtl,
}: {
  currentLocale: string
  isRtl: boolean
}) {
  const payload = await getPayload({ config })

  const resolvedDiscounts = await payload
    .find({
      collection: 'products',
      depth: 1,
      select: MINIMAL_PRODUCT_FIELDS,
      where: {
        and: [{ hasDiscount: { equals: true } }, { stock: { greater_than: 0 } }],
      },
      limit: 20,
    })
    .catch((err) => {
      console.error(err)
      return null
    })

  let productsWithDiscount = resolvedDiscounts ? resolvedDiscounts.docs : []

  if (resolvedDiscounts === null) {
    try {
      const fallbackData = await payload.find({
        collection: 'products',
        depth: 1,
        select: MINIMAL_PRODUCT_FIELDS,
        where: { stock: { greater_than: 0 } },
        limit: 50,
      })
      productsWithDiscount = fallbackData.docs.filter(
        (p: any) => calculateProductPrice(p).isDiscounted,
      )
    } catch (e) {
      console.error('Failed to parse fallback discount checks', e)
    }
  }

  if (productsWithDiscount.length === 0) return null

  return (
    <section className={styles.section}>
      <LocalizedHeading
        currentLocale={currentLocale}
        en="Hot Discounts 🔥"
        ar="خصومات كبرى 🔥"
        ckb="داشکانە گەورەکان 🔥"
        style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}
      />
      <ProductCarousel
        isRtl={isRtl}
        currentLocale={currentLocale}
        products={productsWithDiscount.map((p: any) => formatProductForCarousel(p, currentLocale))}
      />
    </section>
  )
}
