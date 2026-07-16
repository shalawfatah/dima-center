import { getPayload } from 'payload'
import config from '@/payload.config'
import { calculateProductPrice } from '@/utils/price'
import PromoCarousel from '@/components/PromoCarousel'
import ProductCarousel from '@/components/ProductCarousel'
import LocalizedHeading from '@/components/LocalizedHeading'
import Link from 'next/link'
import styles from './page.module.css'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; [key: string]: any }>
}

import type { Metadata } from 'next'
import { CATEGORY_MAP } from '@/utils/categories'
import { getStorefrontMetadata } from '@/utils/seo'
import Image from 'next/image'
import PCBuilderSection from '@/components/PCBuilderSection'
import CategoryCarousel from '@/components/CategoryCarousel'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  return getStorefrontMetadata({ locale: resolvedParams.locale })
}

export default async function StorefrontHome({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const rawLocale = resolvedParams.locale || 'en'
  const currentLocale =
    rawLocale === 'en' || rawLocale === 'ar' || rawLocale === 'ckb' ? rawLocale : 'en'

  const activeCategory = resolvedSearchParams.category || ''
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const dirClass = isRtl ? styles.rtl : styles.ltr

  const payload = await getPayload({ config })

  const englishCategoriesList = CATEGORY_MAP['en']

  // --- Dynamic Routing Link Generator (Kept on Server) ---
  const resolveProductHref = (id: string | number, isCaseOffer: boolean) => {
    const routeSegment = isCaseOffer ? 'case-offers' : 'products'
    return `/${currentLocale}/${routeSegment}/${id}`
  }

  if (activeCategory) {
    const matchedCatEn = CATEGORY_MAP.en.find((c) => c.slug === activeCategory)
    const matchedCatAr = CATEGORY_MAP.ar.find((c) => c.slug === activeCategory)
    const matchedCatCkb = CATEGORY_MAP.ckb.find((c) => c.slug === activeCategory)

    const res = await payload.find({
      collection: 'products',
      where: { 'category.slug': { equals: activeCategory } },
      limit: 100,
    })

    return (
      <div className={`${styles.pageWrapper} ${styles.pageWrapperFiltered} ${dirClass}`}>
        <main className={styles.filteredMain}>
          <div className={styles.filteredHeader}>
            <LocalizedHeading
              currentLocale={currentLocale}
              en={matchedCatEn?.title || 'Products'}
              ar={matchedCatAr?.title || 'المنتجات'}
              ckb={matchedCatCkb?.title || 'کاڵاکان'}
              style={{ fontSize: '1.75rem', fontWeight: '700' }}
            />
            <Link href={`/${currentLocale}`} className={styles.showAllLink}>
              {currentLocale === 'ar'
                ? '← عرض الكل'
                : currentLocale === 'ckb'
                  ? '← پیشاندانی هەموو'
                  : '← Show All'}
            </Link>
          </div>

          {res.docs.length === 0 ? (
            <div className={styles.emptyState}>
              📦{' '}
              {currentLocale === 'ar'
                ? 'لا توجد منتجات في هذه الفئة حالياً.'
                : currentLocale === 'ckb'
                  ? 'هیچ کاڵایەک لەم بەشەدا نییە.'
                  : 'No products found in this category.'}
            </div>
          ) : (
            <div className={styles.productGrid}>
              {res.docs.map((product: any) => {
                const hasImage = product.featuredImage && typeof product.featuredImage === 'object'
                const imageUrl = hasImage ? (product.featuredImage as any).url : null
                const productHref = resolveProductHref(product.id, false)

                return (
                  <Link key={product.id} href={productHref} className={styles.productCardLink}>
                    <div className={styles.productCard}>
                      <div className={styles.productImageWrapper}>
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            width={200}
                            height={200}
                            alt={product.title}
                            className={styles.productImage}
                          />
                        ) : (
                          <span className={styles.productImagePlaceholder}>📦</span>
                        )}
                      </div>
                      <h3 className={styles.productTitle}>{product.title}</h3>
                      <div className={styles.productPrice}>${product.price}</div>
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

  // --- Fetch Case Offers (Full Build Offers) ---
  let caseOffers: any[] = []
  try {
    const fetchedOffers = await payload.find({
      collection: 'case-offers',
      locale: currentLocale,
      limit: 20,
    })
    caseOffers = fetchedOffers.docs
  } catch (err) {
    console.error('Failed to fetch case offers:', err)
  }

  // --- Fetch Standard Discounts ---
  let productsWithDiscount: any[] = []
  try {
    const fetchedDiscounts = await payload.find({
      collection: 'products',
      where: { hasDiscount: { equals: true } },
      limit: 20,
    })
    productsWithDiscount = fetchedDiscounts.docs
  } catch (err) {
    const fallbackData = await payload.find({
      collection: 'products',
      limit: 50,
    })
    productsWithDiscount = fallbackData.docs.filter(
      (p: any) => calculateProductPrice(p).isDiscounted,
    )
  }

  // --- Fetch Categories Matrix ---
  const rawCategoriesWithProducts = await Promise.all(
    englishCategoriesList.map(async (cat: any) => {
      const res = await payload.find({
        collection: 'products',
        where: { 'category.slug': { equals: cat.slug } },
        limit: 20,
      })

      const enTitle = CATEGORY_MAP.en.find((c) => c.slug === cat.slug)?.title || ''
      const arTitle = CATEGORY_MAP.ar.find((c) => c.slug === cat.slug)?.title || ''
      const ckbTitle = CATEGORY_MAP.ckb.find((c) => c.slug === cat.slug)?.title || ''

      return {
        slug: cat.slug,
        en: enTitle,
        ar: arTitle,
        ckb: ckbTitle,
        products: res.docs,
      }
    }),
  )

  // 🎯 SORT: Make sure category 'monitor' appears first in the regular categories array
  const categoriesWithProducts = [...rawCategoriesWithProducts].sort((a, b) => {
    const aIsMonitor = String(a.slug).toLowerCase() === 'monitor'
    const bIsMonitor = String(b.slug).toLowerCase() === 'monitor'

    if (aIsMonitor && !bIsMonitor) return -1
    if (!aIsMonitor && bIsMonitor) return 1
    return 0
  })

  let otherProducts: any[] = []
  try {
    const otherRes = await payload.find({
      collection: 'products',
      where: {
        and: englishCategoriesList.map((cat) => ({
          'category.slug': { not_equals: cat.slug },
        })),
      },
      limit: 20,
    })
    otherProducts = otherRes.docs
  } catch (e) {
    console.error('Failed fetching other categories:', e)
  }

  // Standard product mapper
  const formatProductForCarousel = (p: any) => {
    const isImageObj = p.featuredImage && typeof p.featuredImage === 'object' && p.featuredImage.url
    const productId = String(p.id)
    return {
      ...p,
      id: productId,
      featuredImage: isImageObj
        ? { url: p.featuredImage.url, alt: p.featuredImage.alt || '' }
        : null,
      isCaseOffer: false,
      href: resolveProductHref(productId, false),
    }
  }

  // Custom mapper to bridge CaseOffers properties schema
  const formatCaseOfferForCarousel = (offer: any) => {
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
      href: resolveProductHref(offerId, true),
    }
  }

  return (
    <div className={`${styles.pageWrapper} ${styles.pageWrapperDefault} ${dirClass}`}>
      <CategoryCarousel currentLocale={currentLocale} />

      <div className={styles.promoWrapper}>
        <div className={styles.promoLeft}>
          <PCBuilderSection currentLocale={currentLocale} isRtl={isRtl} />
        </div>
      </div>

      <div className={styles.promoWrapper}>
        <PromoCarousel currentLocale={currentLocale} />
      </div>

      <main className={styles.defaultMain}>
        {/* 🔥 SECTION 1: Full Build Offers / Case Offers */}
        {caseOffers.length > 0 && (
          <section className={styles.sectionFirst}>
            <LocalizedHeading
              currentLocale={currentLocale}
              en="Full Build Offers"
              ar="عروض الكيسات الكاملة"
              ckb="ئۆفەری کەیس"
              style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}
            />
            <ProductCarousel
              isRtl={isRtl}
              currentLocale={currentLocale}
              products={caseOffers.map(formatCaseOfferForCarousel)}
            />
          </section>
        )}

        {/* ⚡ SECTION 2: Standard Hot Discounts */}
        {productsWithDiscount.length > 0 && (
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
              products={productsWithDiscount.map(formatProductForCarousel)}
            />
          </section>
        )}

        {/* Categories Section */}
        {categoriesWithProducts.map((cat) => {
          if (cat.products.length === 0) return null
          return (
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
                products={cat.products.map(formatProductForCarousel)}
              />
            </section>
          )
        })}

        {/* Other Products Section */}
        {otherProducts.length > 0 && (
          <section className={styles.section}>
            <LocalizedHeading
              currentLocale={currentLocale}
              en="Other Products"
              ar="منتجات أخرى"
              ckb="کاڵاکانی تر"
              style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}
            />
            <ProductCarousel
              isRtl={isRtl}
              currentLocale={currentLocale}
              products={otherProducts.map(formatProductForCarousel)}
              cardWidth={100}
              cardHeight={100}
            />
          </section>
        )}
      </main>
    </div>
  )
}
