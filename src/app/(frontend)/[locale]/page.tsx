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
import SectionSkeleton from '@/components/SectionSkeleton'
import { MINIMAL_PRODUCT_FIELDS } from '@/utils/homepage-helpers'
import CategoryDropdownNav from '@/components/CategoryCarousel'

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

  // Declare fonts early so they're available everywhere
  let headingFont = isRtl ? '"Rudaw", sans-serif' : 'system-ui, sans-serif'
  let bodyFont = isRtl ? '"Sarchia", sans-serif' : 'system-ui, sans-serif'
  let dynamicFontFaceCSS = ''

  // 🎯 FETCH generalSettings FIRST so fonts are available for both filtered and default views
  const payload = await getPayload({ config })

  const generalSettings = await payload
    .findGlobal({
      slug: 'general-settings',
      depth: 1,
    })
    .catch((err) => {
      console.error('Error querying general-settings:', err)
      return null
    })

  // 🎯 Update fonts from generalSettings BEFORE checking activeCategory
  const typography = generalSettings?.typography
  const localeMap = {
    ckb: 'kurdish',
    ar: 'arabic',
    en: 'english',
  } as const

  const fontGroupKey = localeMap[currentLocale as keyof typeof localeMap]
  const fontGroup = typography?.[fontGroupKey]

  const headingFontObj = fontGroup?.headingFont
  const bodyFontObj = fontGroup?.bodyFont

  if (headingFontObj && typeof headingFontObj === 'object' && headingFontObj.url) {
    const fontName = `HomePageHeading_${currentLocale}`
    headingFont = `"${fontName}", "Rudaw", sans-serif`
    dynamicFontFaceCSS += `
      @font-face {
        font-family: '${fontName}';
        src: url('${headingFontObj.url}') format('truetype');
        font-display: swap;
      }
    `
  }

  if (bodyFontObj && typeof bodyFontObj === 'object' && bodyFontObj.url) {
    const fontName = `HomePageBody_${currentLocale}`
    bodyFont = `"${fontName}", "Sarchia", sans-serif`
    dynamicFontFaceCSS += `
      @font-face {
        font-family: '${fontName}';
        src: url('${bodyFontObj.url}') format('truetype');
        font-display: swap;
      }
    `
  }

  const resolveProductHref = (id: string | number, isCaseOffer: boolean) => {
    const routeSegment = isCaseOffer ? 'case-offers' : 'products'
    return `/${currentLocale}/${routeSegment}/${id}`
  }

  if (activeCategory) {
    const isDiscountsCategory = activeCategory === 'discounts'

    let validUiCategoryId: string | number | null = null
    if (!isDiscountsCategory) {
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
      validUiCategoryId =
        rawUiCategoryId !== undefined &&
        rawUiCategoryId !== null &&
        !Number.isNaN(Number(rawUiCategoryId))
          ? rawUiCategoryId
          : null
    }

    const fetchLocalizedCategoryTitle = async (locale: 'en' | 'ar' | 'ckb') => {
      if (isDiscountsCategory) {
        if (locale === 'ar') return 'التخفيضات'
        if (locale === 'ckb') return 'داشکاندنەکان'
        return 'Discounts & Offers'
      }

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

    let productWhereCondition: any
    let uiProductWhereCondition: any

    if (isDiscountsCategory) {
      productWhereCondition = {
        and: [{ hasDiscount: { equals: true } }, { stock: { greater_than: 0 } }],
      }
      uiProductWhereCondition = {
        hasDiscount: { equals: true },
      }
    } else {
      const productWhere: any[] = [{ 'category.slug': { equals: activeCategory } }]
      if (validUiCategoryId !== null) {
        productWhere.push({ category: { equals: validUiCategoryId } })
      }

      const uiProductWhere: any[] = [{ 'uiCategory.slug': { equals: activeCategory } }]
      if (validUiCategoryId !== null) {
        uiProductWhere.push({ uiCategory: { equals: validUiCategoryId } })
      }

      productWhereCondition = {
        and: [{ or: productWhere }, { stock: { greater_than: 0 } }],
      }
      uiProductWhereCondition = {
        or: uiProductWhere,
      }
    }

    const [matchedTitleEn, matchedTitleAr, matchedTitleCkb, productsRes, uiProductsRes] =
      await Promise.all([
        fetchLocalizedCategoryTitle('en'),
        fetchLocalizedCategoryTitle('ar'),
        fetchLocalizedCategoryTitle('ckb'),
        payload
          .find({
            collection: 'products',
            locale: currentLocale as 'en' | 'ar' | 'ckb',
            fallbackLocale: 'en',
            depth: 1,
            select: MINIMAL_PRODUCT_FIELDS,
            where: productWhereCondition,
            limit: 100,
          })
          .catch((err) => {
            console.error('Error querying products:', err)
            return { docs: [] }
          }),
        payload
          .find({
            collection: 'ui-products',
            locale: currentLocale as 'en' | 'ar' | 'ckb',
            fallbackLocale: 'en',
            depth: 1,
            where: uiProductWhereCondition,
            limit: 100,
          })
          .catch((err) => {
            console.error('Error querying ui-products:', err)
            return { docs: [] }
          }),
      ])

    const normalizedUiProducts = (uiProductsRes.docs || []).map((item: any) => {
      let resolvedTitle = resolveLocalizedText(item.title, currentLocale)

      if (!resolvedTitle && item.linkedProduct) {
        resolvedTitle = resolveLocalizedText(item.linkedProduct.title, currentLocale)
      }

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

    const productMap = new Map()
    for (const item of [...normalizedProducts, ...normalizedUiProducts]) {
      if (!productMap.has(item.id)) {
        productMap.set(item.id, item)
      }
    }
    const allProducts = Array.from(productMap.values())

    return (
      <>
        {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}

        <div
          className={`${styles.pageWrapper} ${styles.pageWrapperFiltered} ${dirClass}`}
          style={
            {
              '--filtered-heading-font': headingFont,
              '--filtered-body-font': bodyFont,
            } as React.CSSProperties
          }
        >
          <main className={styles.filteredMain}>
            <div className={styles.filteredHeader}>
              <LocalizedHeading
                currentLocale={currentLocale}
                en={matchedTitleEn || 'Products'}
                ar={matchedTitleAr || 'المنتجات'}
                ckb={matchedTitleCkb || 'کاڵاکان'}
                headingFont={headingFont}
                style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                }}
              />
              <Link
                href={`/${currentLocale}`}
                className={styles.showAllLink}
                style={{ fontFamily: 'var(--filtered-body-font)' }}
              >
                {currentLocale === 'ar'
                  ? '← عرض الكل'
                  : currentLocale === 'ckb'
                    ? '← گەڕانەوە'
                    : '← Show All'}
              </Link>
            </div>

            {allProducts.length === 0 ? (
              <div
                className={styles.emptyState}
                style={{ fontFamily: 'var(--filtered-body-font)' }}
              >
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
                            <span
                              className={styles.productImagePlaceholder}
                              style={{ fontFamily: 'var(--filtered-body-font)' }}
                            >
                              📦
                            </span>
                          )}
                        </div>
                        <h3
                          className={styles.productTitle}
                          style={{
                            fontFamily: 'var(--filtered-heading-font)',
                            fontWeight: '600',
                          }}
                        >
                          {product.title}
                        </h3>
                        <div
                          className={styles.productPrice}
                          style={{ fontFamily: 'var(--filtered-body-font)' }}
                        >
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
      </>
    )
  }

  // Default Home View
  const [categoriesRes] = await Promise.all([
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
    <>
      {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}

      <div className={`${styles.pageWrapper} ${styles.pageWrapperDefault} ${dirClass}`}>
        <CategoryDropdownNav
          currentLocale={currentLocale}
          categories={categories}
          generalSettings={generalSettings}
        />

        <div className={styles.promoWrapper}>
          <div className={styles.promoLeft}>
            <PCBuilderSection
              currentLocale={currentLocale}
              isRtl={isRtl}
              backgroundImage={pcBuilderBg}
              foregroundImage={pcBuilderFg}
              headingFont={headingFont}
              bodyFont={bodyFont}
              dynamicFontFaceCSS={dynamicFontFaceCSS}
            />
          </div>
        </div>

        <div className={styles.promoWrapper}>
          <div className={styles.promoLeft}>
            <PromoCarousel
              currentLocale={currentLocale}
              headingFont={headingFont}
              bodyFont={bodyFont}
              dynamicFontFaceCSS={dynamicFontFaceCSS}
            />
          </div>
        </div>

        <main className={styles.defaultMain}>
          <Suspense fallback={<SectionSkeleton cards={8} />}>
            <CategorySections
              currentLocale={currentLocale}
              isRtl={isRtl}
              generalSettings={generalSettings}
              headingFont={headingFont}
              bodyFont={bodyFont}
              dynamicFontFaceCSS={dynamicFontFaceCSS}
              titleColor={generalSettings?.typography?.titleColor ?? undefined}
              bodyColor={generalSettings?.typography?.bodyColor ?? undefined}
            />
          </Suspense>
        </main>
      </div>
    </>
  )
}
