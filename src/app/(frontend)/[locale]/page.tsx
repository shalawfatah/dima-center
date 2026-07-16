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
import { MAIN_CATEGORY_GROUPS } from '@/utils/categories'
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

  // --- Helper: Flatten categories dynamically for active filtering searches ---
  const getFlatCategories = (locale: 'en' | 'ar' | 'ckb') => {
    const groups = MAIN_CATEGORY_GROUPS[locale] || []
    const list: { title: string; slug: string }[] = []

    groups.forEach((group) => {
      if (group.slug) {
        list.push({ title: group.title, slug: group.slug })
      } else if (group.subCategories) {
        group.subCategories.forEach((sub) => {
          list.push({ title: sub.title, slug: sub.slug })
        })
      }
    })
    return list
  }

  // --- Dynamic Routing Link Generator ---
  const resolveProductHref = (id: string | number, isCaseOffer: boolean) => {
    const routeSegment = isCaseOffer ? 'case-offers' : 'products'
    return `/${currentLocale}/${routeSegment}/${id}`
  }

  // --- Active Selected Category Filter View (Unchanged fallback) ---
  if (activeCategory) {
    const flatEn = getFlatCategories('en')
    const flatAr = getFlatCategories('ar')
    const flatCkb = getFlatCategories('ckb')

    const matchedCatEn = flatEn.find((c) => c.slug === activeCategory)
    const matchedCatAr = flatAr.find((c) => c.slug === activeCategory)
    const matchedCatCkb = flatCkb.find((c) => c.slug === activeCategory)

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
                  ? '← گەڕانەوە'
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

  // --- Dynamic Category Organization ---
  const majorGroupsEn = MAIN_CATEGORY_GROUPS['en'] || []
  const majorGroupsAr = MAIN_CATEGORY_GROUPS['ar'] || []
  const majorGroupsCkb = MAIN_CATEGORY_GROUPS['ckb'] || []

  // Final array of renderable sections
  const homepageSections: {
    slug: string
    en: string
    ar: string
    ckb: string
    products: any[]
  }[] = []

  // Process all major groups to separate "Computer Parts" minors, keep "Monitor" solo, and combine rest
  for (let idx = 0; idx < majorGroupsEn.length; idx++) {
    const group = majorGroupsEn[idx]
    const groupAr = majorGroupsAr[idx]
    const groupCkb = majorGroupsCkb[idx]

    const isComputerParts =
      group.title.toLowerCase().includes('computer parts') ||
      group.title.toLowerCase().includes('parts')
    const isMonitor = group.slug && group.slug.toLowerCase() === 'monitor'

    if (isMonitor) {
      // 1. Monitor (Independent Major Category)
      const res = await payload.find({
        collection: 'products',
        where: { 'category.slug': { equals: 'monitor' } },
        limit: 20,
      })
      homepageSections.push({
        slug: 'monitor',
        en: group.title,
        ar: groupAr?.title || group.title,
        ckb: groupCkb?.title || group.title,
        products: res.docs,
      })
    } else if (isComputerParts && group.subCategories) {
      // 2. Computer Parts -> Split out every single inner subcategory independently
      for (let subIdx = 0; subIdx < group.subCategories.length; subIdx++) {
        const subEn = group.subCategories[subIdx]
        const subAr = groupAr?.subCategories?.[subIdx]
        const subCkb = groupCkb?.subCategories?.[subIdx]

        const res = await payload.find({
          collection: 'products',
          where: { 'category.slug': { equals: subEn.slug } },
          limit: 20,
        })

        if (res.docs.length > 0) {
          homepageSections.push({
            slug: subEn.slug,
            en: subEn.title,
            ar: subAr?.title || subEn.title,
            ckb: subCkb?.title || subEn.title,
            products: res.docs,
          })
        }
      }
    } else {
      // 3. Any other non-parts groups (Combined collectively under their parent Title)
      let products: any[] = []
      if (group.slug) {
        const res = await payload.find({
          collection: 'products',
          where: { 'category.slug': { equals: group.slug } },
          limit: 20,
        })
        products = res.docs
      } else if (group.subCategories) {
        const subSlugs = group.subCategories.map((sub) => sub.slug)
        const res = await payload.find({
          collection: 'products',
          where: { 'category.slug': { in: subSlugs } },
          limit: 20,
        })
        products = res.docs
      }

      if (products.length > 0) {
        homepageSections.push({
          slug: group.slug || `group-${idx}`,
          en: group.title,
          ar: groupAr?.title || group.title,
          ckb: groupCkb?.title || group.title,
          products,
        })
      }
    }
  }

  // --- 🎯 Sort Rules: Ensure "Monitor" section stays on top of other regular category sections ---
  const sortedSections = [...homepageSections].sort((a, b) => {
    const aIsMonitor = a.slug === 'monitor'
    const bIsMonitor = b.slug === 'monitor'
    if (aIsMonitor && !bIsMonitor) return -1
    if (!aIsMonitor && bIsMonitor) return 1
    return 0
  })

  // --- Fetch Other Uncategorized Products ---
  let otherProducts: any[] = []
  try {
    const flatEnSlugs = getFlatCategories('en').map((c) => c.slug)
    const otherRes = await payload.find({
      collection: 'products',
      where: {
        'category.slug': {
          not_in: flatEnSlugs,
        },
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

  // Case Offers mapping mapper
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
              cardHeight={330}
              cardWidth={230}
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

        {/* 📦 SECTIONS 3+: Dynamic Category blocks (starting with Monitor, followed by each CPU, GPU, RAM, etc., then any remaining groups) */}
        {sortedSections.map((cat) => {
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
      </main>
    </div>
  )
}
