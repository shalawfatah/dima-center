import { getPayload } from 'payload'
import config from '@/payload.config'
import ProductCarousel from '@/components/ProductCarousel'
import LocalizedHeading from '@/components/LocalizedHeading'
// import { formatCaseOfferForCarousel } from '@/utils/homepage-helpers'
import styles from '@/styles/homepage.module.css' // adjust if your page.module.css lives elsewhere

export default async function CaseOffersSection({
  currentLocale,
  isRtl,
}: {
  currentLocale: string
  isRtl: boolean
}) {
  const payload = await getPayload({ config })

  const resolvedCaseOffers = await payload
    .find({
      collection: 'case-offers',
      locale: currentLocale as any,
      depth: 1,
      limit: 20,
    })
    .catch((err) => {
      console.error(err)
      return { docs: [] }
    })

  const caseOffers = resolvedCaseOffers.docs || []
  if (caseOffers.length === 0) return null

  return (
    <section className={styles.sectionFirst}>
      <LocalizedHeading
        currentLocale={currentLocale}
        en="Full Build Offers"
        ar="عروض الكيسات الكاملة"
        ckb="ئۆفەری کەیس"
        style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}
      />
    </section>
  )
}
