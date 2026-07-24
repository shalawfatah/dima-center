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
import { getStorefrontMetadata } from '@/utils/seo'
import Image from 'next/image'
import CategoryCarousel from '@/components/CategoryCarousel'
import SectionSkeleton from '@/components/SectionSkeleton'
import { MINIMAL_PRODUCT_FIELDS } from '@/utils/homepage-helpers'

const PCBuilderSection = dynamic(() => import('@/components/PCBuilderSection'), {
  loading: () => <div className={styles.pcBuilderSkeleton} />,
})

const CategorySections = dynamic(() => import('@/components/CategorySections'), {
  loading: () => <SectionSkeleton cards={8} />,
})

export const revalidate = 3600

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  return getStorefrontMetadata({ locale: resolvedParams.locale })
}

/**
 * Safely resolves localized fields with strict fallback hierarchy:
 * Preferred Locale -> EN -> AR -> Any available string
 */
function resolveLocalizedText(val: any, preferredLocale: string): string {
  if (!val) return ''
  if (typeof val === 'string') return val.trim()

  if (typeof val === 'object') {
    if (
      val[preferredLocale] &&
      typeof val[preferredLocale] === 'string' &&
      val[preferredLocale].trim()
    ) {
      return val[preferredLocale].trim()
    }
    if (val.en && typeof val.en === 'string' && val.en.trim()) {
      return val.en.trim()
    }
    if (val.ar && typeof val.ar === 'string' && val.ar.trim()) {
      return val.ar.trim()
    }
    // Fallback to the first non-empty string entry in the object
    const firstAvailable = Object.values(val).find(
      (v) => typeof v === 'string' && v.trim().length > 0,
    ) as string | undefined
    if (firstAvailable) return firstAvailable.trim()
  }

  return ''
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

    // 1. Resolve matching UI Category document and its ID
    const categoryDocRes = await payload.find({
      collection: 'ui-categories',
      where: {
        or: [
          { slug: { equals: activeCategory } },
          { 'subCategories.slug': { equals: activeCategory } },
        ],
      },
      limit: 1,
    })

    const uiCategoryDoc = categoryDocRes.docs[0]
    const rawUiCategoryId = uiCategoryDoc?.id
    const validUiCategoryId =
      rawUiCategoryId !== undefined &&
      rawUiCategoryId !== null &&
      !Number.isNaN(Number(rawUiCategoryId))
        ? rawUiCategoryId
        : null

    // 2. Fetch localized heading text
    const fetchLocalizedCategoryTitle = async (locale: 'en' | 'ar' | 'ckb') => {
      const categoriesRes = await payload.find({
        collection: 'ui-categories',
        locale,
        limit: 200,
      })

      for (const cat of categoriesRes.docs) {
        if (cat.slug === activeCategory) return cat.title
        if (cat.isContainer && Array.isArray(cat.subCategories)) {
          const matchedSub = cat.subCategories.find((sub: any) => sub.slug === activeCategory)
          if (matchedSub?.title) return matchedSub.title
        }
      }
      return null
    }

    // 3. Construct specific field conditions per schema
    const productWhere: any[] = [{ 'category.slug': { equals: activeCategory } }]
    if (validUiCategoryId !== null) {
      productWhere.push({ category: { equals: validUiCategoryId } })
    }

    const uiProductWhere: any[] = [{ 'uiCategory.slug': { equals: activeCategory } }]
    if (validUiCategoryId !== null) {
      uiProductWhere.push({ uiCategory: { equals: validUiCategoryId } })
    }

    // 4. Fetch all locale fallbacks by querying with fallback enabled or raw object parsing
    const [matchedTitleEn, matchedTitleAr, matchedTitleCkb, productsRes, uiProductsRes] =
      await Promise.all([
        fetchLocalizedCategoryTitle('en'),
        fetchLocalizedCategoryTitle('ar'),
        fetchLocalizedCategoryTitle('ckb'),

        // Standard products
        payload
          .find({
            collection: 'products',
            locale: currentLocale as 'en' | 'ar' | 'ckb',
            fallbackLocale: 'en', // Payload native fallback to EN if CKB missing
            depth: 1,
            select: MINIMAL_PRODUCT_FIELDS,
            where: {
              and: [{ or: productWhere }, { stock: { greater_than: 0 } }],
            },
            limit: 100,
          })
          .catch((err) => {
            console.error('Error querying products:', err)
            return { docs: [] }
          }),

        // UI products
        payload
          .find({
            collection: 'ui-products',
            locale: currentLocale as 'en' | 'ar' | 'ckb',
            fallbackLocale: 'en', // Payload native fallback to EN if CKB missing
            depth: 1,
            where: {
              or: uiProductWhere,
            },
            limit: 100,
          })
          .catch((err) => {
            console.error('Error querying ui-products:', err)
            return { docs: [] }
          }),
      ])

    // Normalize ui-products with robust multi-layer fallback
    const normalizedUiProducts = (uiProductsRes.docs || []).map((item: any) => {
      let resolvedTitle = resolveLocalizedText(item.title, currentLocale)

      // If empty on UI Product itself, try the linked CRM product title
      if (!resolvedTitle && item.linkedProduct) {
        resolvedTitle = resolveLocalizedText(item.linkedProduct.title, currentLocale)
      }

      // Final fallback if name field exists
      if (!resolvedTitle && item.name) {
        resolvedTitle = resolveLocalizedText(item.name, currentLocale)
      }

      const resolvedPrice = item.price ?? item.linkedProduct?.price ?? null

      return {
        id: item.id,
        title: resolvedTitle || 'Untitled',
        price: resolvedPrice,
        featuredImage: item.image || item.linkedProduct?.featuredImage || item.linkedProduct?.image,
        isCaseOffer: activeCategory === 'case-offers',
      }
    })

    // Normalize standard products
    const normalizedProducts = (productsRes.docs || []).map((item: any) => {
      let resolvedTitle = resolveLocalizedText(item.title, currentLocale)
      if (!resolvedTitle && item.name) {
        resolvedTitle = resolveLocalizedText(item.name, currentLocale)
      }

      return {
        ...item,
        title: resolvedTitle || 'Untitled',
        isCaseOffer: activeCategory === 'case-offers',
      }
    })

    // Deduplicate items by ID
    const productMap = new Map()
    for (const item of [...normalizedProducts, ...normalizedUiProducts]) {
      if (!productMap.has(item.id)) {
        productMap.set(item.id, item)
      }
    }
    const allProducts = Array.from(productMap.values())

    return (
      <div className={`${styles.pageWrapper} ${styles.pageWrapperFiltered} ${dirClass}`}>
        <main className={styles.filteredMain}>
          <div className={styles.filteredHeader}>
            <LocalizedHeading
              currentLocale={currentLocale}
              en={matchedTitleEn || 'Products'}
              ar={matchedTitleAr || 'المنتجات'}
              ckb={matchedTitleCkb || 'کاڵاکان'}
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

          {allProducts.length === 0 ? (
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
              {allProducts.map((product: any) => {
                const imgData = product.featuredImage || product.image
                let imageUrl: string | null = null

                if (typeof imgData === 'string') {
                  imageUrl = imgData
                } else if (typeof imgData === 'object' && imgData?.url) {
                  imageUrl = imgData.url
                }

                const productHref = resolveProductHref(product.id, !!product.isCaseOffer)

                return (
                  <Link key={product.id} href={productHref} className={styles.productCardLink}>
                    <div className={styles.productCard}>
                      <div className={styles.productImageWrapper}>
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            width={200}
                            height={200}
                            alt={product.title || 'Product'}
                            className={styles.productImage}
                          />
                        ) : (
                          <span className={styles.productImagePlaceholder}>📦</span>
                        )}
                      </div>
                      <h3 className={styles.productTitle}>{product.title}</h3>
                      <div className={styles.productPrice}>
                        {product.price !== null && product.price !== undefined
                          ? `$${product.price}`
                          : ''}
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

  // 🏠 DEFAULT HOME VIEW
  const payload = await getPayload({ config })

  // Fetch UI Categories and General Settings in parallel
  const [categoriesRes, generalSettings] = await Promise.all([
    payload.find({
      collection: 'ui-categories',
      locale: currentLocale as 'en' | 'ar' | 'ckb',
      fallbackLocale: 'en',
      sort: 'order',
      where: {
        hideInCarousel: { equals: false },
      },
      limit: 100,
    }),
    payload
      .findGlobal({
        slug: 'general-settings',
        depth: 1, // Ensures image relations (backgroundImage, foregroundImage) return full objects
      })
      .catch((err) => {
        console.error('Error querying general-settings:', err)
        return null
      }),
  ])

  const categories = categoriesRes.docs.map((doc: any) => ({
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    isContainer: doc.isContainer,
    subCategories: doc.subCategories || [],
  }))

  const pcBuilderBg = generalSettings?.pcBuilder?.backgroundImage
  const pcBuilderFg = generalSettings?.pcBuilder?.foregroundImage

  return (
    <div className={`${styles.pageWrapper} ${styles.pageWrapperDefault} ${dirClass}`}>
      <CategoryCarousel currentLocale={currentLocale} categories={categories} />

      <div className={styles.promoWrapper}>
        <div className={styles.promoLeft}>
          <PCBuilderSection
            currentLocale={currentLocale}
            isRtl={isRtl}
            backgroundImage={pcBuilderBg}
            foregroundImage={pcBuilderFg}
          />
        </div>
      </div>

      <div className={styles.promoWrapper}>
        <div className={styles.promoLeft}>
          <PromoCarousel currentLocale={currentLocale} />
        </div>
      </div>
      <main className={styles.defaultMain}>
        <Suspense fallback={<SectionSkeleton cards={8} />}>
          <CategorySections currentLocale={currentLocale} isRtl={isRtl} />
        </Suspense>
      </main>
    </div>
  )
}
