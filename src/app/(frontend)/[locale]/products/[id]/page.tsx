import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { calculateProductPrice } from '@/utils/price'

import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'

import ProductBreadcrumb from '@/components/product/ProductBreadcrumb'
import ProductMediaColumn from '@/components/product/ProductMediaColumn'
import ProductInfoSidebar from '@/components/product/ProductInfoSidebar'
import RelatedProducts from '@/components/product/RelatedProducts'
import styles from '@/styles/product-detail.module.css'

interface ProductPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

// 🎯 DYNAMIC PRODUCT METADATA
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const currentLocale = resolvedParams.locale || 'en'
  const productId = resolvedParams.id

  // 1. Grab baseline SEO settings (site name, canonical structures, etc.)
  const baseMeta = await getStorefrontMetadata({ locale: currentLocale })

  try {
    const payload = await getPayload({ config })

    // 2. Fetch the specific product for its localized metadata fields
    const product = await payload.findByID({
      collection: 'products',
      id: productId,
      locale: currentLocale as 'en' | 'ar' | 'ckb',
    })

    if (!product) return baseMeta

    const title = product.title || ''
    const description = typeof product.description === 'string' ? product.description : ''

    // Extract image URL if it's populated cleanly
    const imageUrl =
      product.featuredImage && typeof product.featuredImage === 'object'
        ? (product.featuredImage as any).url
        : undefined

    // 🎯 FIX: Cast baseMeta.title safely to bypass internal missing type definitions
    const titleValue = baseMeta?.title as any
    const baseSiteTitle =
      titleValue && typeof titleValue === 'object'
        ? titleValue.absolute || titleValue.default
        : typeof titleValue === 'string'
          ? titleValue
          : 'Storefront'

    return {
      ...baseMeta,
      title: `${title} | ${baseSiteTitle}`,
      description: description || baseMeta.description,
      openGraph: {
        ...baseMeta?.openGraph,
        title,
        description,
        type: 'video.other', // Standard for product item pages
        ...(imageUrl && {
          images: [
            {
              url: imageUrl,
              width: 800,
              height: 800,
              alt: title,
            },
          ],
        }),
      },
    }
  } catch (error) {
    // Graceful fallback to default localization structure if Document lookup errors out
    return baseMeta
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const currentLocale = resolvedParams.locale || 'en'
  const productId = resolvedParams.id
  const payload = await getPayload({ config })

  // 1. Fetch Global Settings for the Active Exchange Rate
  // (kept as a fallback only — used when a product doesn't have a direct
  // priceIQD value stored, e.g. legacy/unsynced items)
  let settings
  try {
    settings = await payload.findGlobal({
      slug: 'general-settings',
    })
  } catch (err) {
    console.error('Failed fetching general settings config', err)
  }
  const exchangeRate = settings?.exchangeRate || 1500

  let product
  try {
    product = await payload.findByID({
      collection: 'products',
      id: productId,
      locale: currentLocale as 'en' | 'ar' | 'ckb',
    })
  } catch (err) {
    return notFound()
  }

  const relatedData = await payload.find({
    collection: 'products',
    locale: currentLocale as 'en' | 'ar' | 'ckb',
    where: {
      and: [
        {
          category: {
            equals:
              typeof product.category === 'object'
                ? (product.category as any).id
                : product.category,
          },
        },
        { id: { not_equals: product.id } },
      ],
    },
    limit: 4,
  })

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const featuredImageUrl =
    product.featuredImage && typeof product.featuredImage === 'object'
      ? (product.featuredImage as any).url
      : null

  const mainPriceSpecs = calculateProductPrice({
    ...product,
    hasDiscount: product.hasDiscount ?? false,
  } as any)

  const productCategoryName =
    product.category && typeof product.category === 'object'
      ? (product.category as any).title || (product.category as any).name
      : ''

  // 2. Calculate runtime values based on final pricing nodes
  const usdPriceNum = Number(mainPriceSpecs.finalPrice)
  const usdOriginalNum = Number(mainPriceSpecs.originalPrice)

  // 🎯 Use the product's real, synced priceIQD value directly instead of
  // deriving IQD purely from the branch exchange rate — the exchange rate
  // is only a fallback for products that don't have a priceIQD yet.
  const storedIqdPrice =
    product.priceIQD !== null && product.priceIQD !== undefined ? Number(product.priceIQD) : null

  let iqdPriceNum: number
  if (storedIqdPrice && storedIqdPrice > 0) {
    if (mainPriceSpecs.isDiscounted && usdOriginalNum > 0) {
      // Apply the same relative discount (percentage or fixed) to the real
      // IQD price by scaling it with the USD final/original ratio, so the
      // displayed dinar total stays consistent with whatever discount rule
      // was used (percentage or fixed-dollar).
      const discountRatio = usdPriceNum / usdOriginalNum
      iqdPriceNum = storedIqdPrice * discountRatio
    } else {
      iqdPriceNum = storedIqdPrice
    }
  } else {
    // Fallback: no direct priceIQD on this product — derive it from the
    // branch exchange rate like before.
    iqdPriceNum = usdPriceNum * exchangeRate
  }

  console.log('Title Type:', typeof product.title, 'Value:', product.title)
  console.log('pp ', product)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        direction: isRtl ? 'rtl' : 'ltr',
        background: '#f3f3f3',
      }}
    >
      <main
        style={{
          background: '#f3f3f3',
          flex: '1',
          padding: '2rem max(1.5rem, calc((100% - 1800px)/2))',
        }}
      >
        <ProductBreadcrumb currentLocale={currentLocale} categoryName={productCategoryName} />

        <div className={styles['product-layout-grid']}>
          {/* 🎯 FIXED: Explicit fallbacks added below for type assignment safety */}
          <ProductMediaColumn
            title={product.title}
            featuredImageUrl={featuredImageUrl}
            imagesGallery={product.imagesGallery}
            isRtl={isRtl}
            currentLocale={currentLocale}
            isDiscounted={mainPriceSpecs.isDiscounted}
            badgeText={mainPriceSpecs.badgeText || ''}
            technicalSpecs={product.technicalSpecs || undefined}
          />

          <ProductInfoSidebar
            product={product}
            currentLocale={currentLocale}
            isRtl={isRtl}
            finalPrice={usdPriceNum}
            originalPrice={usdOriginalNum}
            isDiscounted={mainPriceSpecs.isDiscounted}
            iqdPrice={iqdPriceNum}
          />
        </div>

        <RelatedProducts
          items={relatedData.docs}
          currentLocale={currentLocale}
          isRtl={isRtl}
          exchangeRate={exchangeRate}
        />
      </main>
    </div>
  )
}
