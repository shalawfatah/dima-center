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
    category_slug: string
    id: string
  }>
}

// 🎯 Fast ID lookup helper (handles both numeric and string IDs gracefully)
async function fetchProductById(id: string, locale: string, payload: any) {
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : id

  // 1. Try 'products' collection
  try {
    const product = await payload.findByID({
      collection: 'products',
      id: numericId,
      locale,
    })
    if (product) return { product, collection: 'products' as const }
  } catch (err) {
    // ID didn't match in products
  }

  // 2. Fallback to 'ui-products' collection
  try {
    const uiProduct = await payload.findByID({
      collection: 'ui-products',
      id: numericId,
      locale,
    })
    if (uiProduct) return { product: uiProduct, collection: 'ui-products' as const }
  } catch (err) {
    // ID didn't match in ui-products
  }

  return null
}

// 🎯 DYNAMIC PRODUCT METADATA
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const currentLocale = resolvedParams.locale || 'en'
  const productId = resolvedParams.id

  const baseMeta = await getStorefrontMetadata({ locale: currentLocale })

  try {
    const payload = await getPayload({ config })
    const result = await fetchProductById(productId, currentLocale, payload)

    if (!result) return baseMeta
    const { product } = result

    const title = product.title || ''
    const description = typeof product.description === 'string' ? product.description : ''

    const imageUrl =
      product.featuredImage && typeof product.featuredImage === 'object'
        ? (product.featuredImage as any).url
        : undefined

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
        type: 'video.other',
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
    return baseMeta
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const currentLocale = resolvedParams.locale || 'en'
  const productId = resolvedParams.id
  const payload = await getPayload({ config })

  let settings
  try {
    settings = await payload.findGlobal({
      slug: 'general-settings',
    })
  } catch (err) {
    console.error('Failed fetching general settings config', err)
  }
  const exchangeRate = settings?.exchangeRate || 1500

  // 🎯 Fetch product
  const result = await fetchProductById(productId, currentLocale, payload)

  if (!result) {
    return notFound()
  }

  const { product, collection } = result

  // 🎯 Safely resolve category ID across both Collections (category or uiCategory)
  const categoryObject = product.category || product.uiCategory
  const categoryId =
    typeof categoryObject === 'object' && categoryObject !== null
      ? categoryObject.id
      : categoryObject

  // 🎯 Fetch related products safely without null crashes
  let relatedDocs: any[] = []

  if (categoryId) {
    const targetCollection = collection === 'ui-products' ? 'ui-products' : 'products'
    const categoryKey =
      collection === 'ui-products' && product.uiCategory ? 'uiCategory' : 'category'

    try {
      const relatedData = await payload.find({
        collection: targetCollection,
        depth: 2,
        locale: currentLocale as 'en' | 'ar' | 'ckb',
        where: {
          and: [{ [categoryKey]: { equals: categoryId } }, { id: { not_equals: product.id } }],
        },
        limit: 4,
      })
      relatedDocs = relatedData.docs
    } catch (err) {
      console.error('Failed fetching related products', err)
    }
  }

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
    categoryObject && typeof categoryObject === 'object'
      ? categoryObject.title || categoryObject.name || ''
      : ''

  const usdPriceNum = Number(mainPriceSpecs.finalPrice)
  const usdOriginalNum = Number(mainPriceSpecs.originalPrice)

  const storedIqdPrice =
    product.priceIQD !== null && product.priceIQD !== undefined ? Number(product.priceIQD) : null

  let iqdPriceNum: number
  if (storedIqdPrice && storedIqdPrice > 0) {
    if (mainPriceSpecs.isDiscounted && usdOriginalNum > 0) {
      const discountRatio = usdPriceNum / usdOriginalNum
      iqdPriceNum = storedIqdPrice * discountRatio
    } else {
      iqdPriceNum = storedIqdPrice
    }
  } else {
    iqdPriceNum = usdPriceNum * exchangeRate
  }

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
          items={relatedDocs}
          currentLocale={currentLocale}
          isRtl={isRtl}
          exchangeRate={exchangeRate}
        />
      </main>
    </div>
  )
}
