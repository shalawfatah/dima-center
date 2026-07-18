import { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import dynamic from 'next/dynamic'
import PromoCarousel from '@/components/PromoCarousel'
import LocalizedHeading from '@/components/LocalizedHeading'
import Link from 'next/link'
import styles from '@/styles/homepage.module.css'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; [key: string]: any }>
}

import type { Metadata } from 'next'
import { MAIN_CATEGORY_GROUPS } from '@/utils/categories'
import { getStorefrontMetadata } from '@/utils/seo'
import Image from 'next/image'
import CategoryCarousel from '@/components/CategoryCarousel'
import SectionSkeleton from '@/components/SectionSkeleton'
import { MINIMAL_PRODUCT_FIELDS, getFlatCategories } from '@/utils/homepage-helpers'

// ⚡ Dynamic components split the initial JS bundle down to fix the 4.3s execution blocks
const PCBuilderSection = dynamic(() => import('@/components/PCBuilderSection'), {
  loading: () => <div className={styles.pcBuilderSkeleton} />,
})

const CaseOffersSection = dynamic(() => import('@/components/CaseOffersSection'), {
  loading: () => <SectionSkeleton />,
})

const DiscountsSection = dynamic(() => import('@/components/DiscountsSection'), {
  loading: () => <SectionSkeleton />,
})

const CategorySections = dynamic(() => import('@/components/CategorySections'), {
  loading: () => <SectionSkeleton cards={8} />,
})

export const revalidate = 3600

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

  const resolveProductHref = (id: string | number, isCaseOffer: boolean) => {
    const routeSegment = isCaseOffer ? 'case-offers' : 'products'
    return `/${currentLocale}/${routeSegment}/${id}`
  }

  // 🎯 FILTERED VIEW (IF CATEGORY QUERY PRESENT)
  if (activeCategory) {
    const payload = await getPayload({ config })

    const flatEn = getFlatCategories(MAIN_CATEGORY_GROUPS['en'] || [])
    const flatAr = getFlatCategories(MAIN_CATEGORY_GROUPS['ar'] || [])
    const flatCkb = getFlatCategories(MAIN_CATEGORY_GROUPS['ckb'] || [])

    const matchedCatEn = flatEn.find((c) => c.slug === activeCategory)
    const matchedCatAr = flatAr.find((c) => c.slug === activeCategory)
    const matchedCatCkb = flatCkb.find((c) => c.slug === activeCategory)

    const res = await payload.find({
      collection: 'products',
      depth: 1,
      select: MINIMAL_PRODUCT_FIELDS,
      where: {
        and: [{ 'category.slug': { equals: activeCategory } }, { stock: { greater_than: 0 } }],
      },
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

  // 🏠 DEFAULT HOME VIEW
  return (
    <div className={`${styles.pageWrapper} ${styles.pageWrapperDefault} ${dirClass}`}>
      <CategoryCarousel currentLocale={currentLocale} />

      <div className={styles.promoWrapper}>
        <div className={styles.promoLeft}>
          <PCBuilderSection currentLocale={currentLocale} isRtl={isRtl} />
        </div>
      </div>

      <div className={styles.promoWrapper}>
        <div className={styles.promoLeft}>
          <PromoCarousel currentLocale={currentLocale} />
        </div>
      </div>

      <main className={styles.defaultMain}>
        <Suspense fallback={<SectionSkeleton />}>
          <CaseOffersSection currentLocale={currentLocale} isRtl={isRtl} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <DiscountsSection currentLocale={currentLocale} isRtl={isRtl} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton cards={8} />}>
          <CategorySections currentLocale={currentLocale} isRtl={isRtl} />
        </Suspense>
      </main>
    </div>
  )
}
