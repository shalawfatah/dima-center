import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'
import LocalizedHeading from '@/components/LocalizedHeading'
import styles from '../page.module.css' // Reuses your existing grid styles

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function CaseOffers({ params }: PageProps) {
  const resolvedParams = await params
  const rawLocale = resolvedParams.locale || 'en'
  const currentLocale =
    rawLocale === 'en' || rawLocale === 'ar' || rawLocale === 'ckb' ? rawLocale : 'en'

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const dirClass = isRtl ? styles.rtl : styles.ltr

  const payload = await getPayload({ config })

  // --- Fetch Case Offers ---
  let caseOffers: any[] = []
  try {
    const fetchedOffers = await payload.find({
      collection: 'case-offers',
      locale: currentLocale,
      limit: 100, // Show all available build offers
    })
    caseOffers = fetchedOffers.docs
  } catch (err) {
    console.error('Failed to fetch case offers:', err)
  }

  // --- Dynamic Routing Link Generator (Matches main page logic) ---
  const resolveProductHref = (id: string | number) => {
    return `/${currentLocale}/case-offers/${id}`
  }

  return (
    <div
      className={`${styles.pageWrapper} ${styles.pageWrapperFiltered} ${dirClass}`}
      style={{ backgroundColor: '#f3f3f3', minHeight: '100vh' }} // Forces custom background color
    >
      <main className={styles.filteredMain} style={{ padding: '2rem 1rem' }}>
        {/* Dynamic Localized Header */}
        <div className={styles.filteredHeader}>
          <LocalizedHeading
            currentLocale={currentLocale}
            en="Full Build Offers"
            ar="عروض الكيسات الكاملة"
            ckb="ئۆفەری کەیس"
            style={{ fontSize: '1.75rem', fontWeight: '700' }}
          />
          <Link href={`/${currentLocale}`} className={styles.showAllLink}>
            {currentLocale === 'ar'
              ? '← العودة للرئيسية'
              : currentLocale === 'ckb'
                ? '← گەڕانەوە بۆ سەرەکی'
                : '← Back to Home'}
          </Link>
        </div>

        {/* Product Grid Layout mapped directly to case-offers schema */}
        {caseOffers.length === 0 ? (
          <div className={styles.emptyState}>
            📦{' '}
            {currentLocale === 'ar'
              ? 'لا توجد عروض كيسات متوفرة حالياً.'
              : currentLocale === 'ckb'
                ? 'هیچ ئۆفەرێکی کەیس بەردەست نییە لە ئێستادا.'
                : 'No build offers available at the moment.'}
          </div>
        ) : (
          <div className={styles.productGrid}>
            {caseOffers.map((offer: any) => {
              // Extract and sanitize image parameters
              const isImageObj =
                offer.featured_image &&
                typeof offer.featured_image === 'object' &&
                offer.featured_image.url

              let imageUrl = isImageObj ? offer.featured_image.url : null
              if (imageUrl && imageUrl.includes(' ')) {
                imageUrl = imageUrl.replace(/ /g, '%20')
              }

              const originalPrice = Number(offer.price)
              const promoPrice = offer.discountedPrice ? Number(offer.discountedPrice) : null
              const hasPromo = !!promoPrice && promoPrice < originalPrice
              const offerHref = resolveProductHref(offer.id)

              return (
                <Link key={offer.id} href={offerHref} className={styles.productCardLink}>
                  <div className={styles.productCard} style={{ backgroundColor: '#ffffff' }}>
                    <div className={styles.productImageWrapper}>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          width={200}
                          height={200}
                          alt={offer.title}
                          className={styles.productImage}
                        />
                      ) : (
                        <span className={styles.productImagePlaceholder}>🖥️</span>
                      )}
                    </div>

                    <h3 className={styles.productTitle}>{offer.title}</h3>

                    <div
                      className={styles.productPrice}
                      style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                    >
                      {hasPromo ? (
                        <>
                          <span style={{ color: '#ff3b30', fontWeight: '700' }}>${promoPrice}</span>
                          <span
                            style={{
                              textDecoration: 'line-through',
                              color: '#888',
                              fontSize: '0.9rem',
                            }}
                          >
                            ${originalPrice}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontWeight: '700' }}>${originalPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
