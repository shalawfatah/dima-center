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

/**
 * Safe helper to sanitize string values
 */
function sanitizeString(val: any): string | null {
  if (typeof val === 'string' && val.trim() !== '') {
    return val.trim()
  }
  return null
}

// 🎯 Safe helper to extract localized, plain text, or rich text titles with multi-locale fallback
function resolveTitle(product: any, locale: string): string {
  if (!product) return ''

  // 1. Direct top-level checks (covers pre-formatted or top-level properties)
  const directTitle =
    sanitizeString(product.title) ||
    sanitizeString(product.name) ||
    sanitizeString(product.productName) ||
    sanitizeString(product.label) ||
    sanitizeString(product.title_en)

  if (directTitle) return directTitle

  // 2. Localized Object or Rich Text AST
  const rawTitle = product.title || product.name || product.productName || product.label

  if (typeof rawTitle === 'object' && rawTitle !== null) {
    // Rich Text field handling (Lexical / Slate AST)
    if (rawTitle.root || Array.isArray(rawTitle.children)) {
      try {
        const children = rawTitle.root?.children || rawTitle.children || []
        const text = children
          .map((c: any) => c.text || c.children?.map((tc: any) => tc.text).join('') || '')
          .join(' ')
          .trim()
        if (text) return text
      } catch (e) {
        // Fallback below
      }
    }

    // Localized dictionary handling: Requested Locale -> English -> Arabic -> Kurdish -> Any String
    const localizedStr =
      sanitizeString(rawTitle[locale]) ||
      sanitizeString(rawTitle.en) ||
      sanitizeString(rawTitle.ar) ||
      sanitizeString(rawTitle.ckb) ||
      Object.values(rawTitle).map(sanitizeString).find(Boolean)

    if (localizedStr) return localizedStr
  }

  // 3. Fallback check for explicit english field property
  const explicitEn = sanitizeString(product.title_en)
  if (explicitEn) return explicitEn

  return 'Untitled Product'
}

// 🎯 Safe helper to extract image URL across products and ui-products
function resolveImageUrl(product: any): string | null {
  if (!product) return null

  // 1. Check image field
  const img = product.image
  if (typeof img === 'string' && img.startsWith('http')) return img
  if (typeof img === 'object' && img?.url) return img.url

  // 2. Check featuredImage
  const featured = product.featuredImage
  if (typeof featured === 'string' && featured.startsWith('http')) return featured
  if (typeof featured === 'object' && featured?.url) return featured.url

  // 3. Fallback to images gallery array
  if (Array.isArray(product.imagesGallery) && product.imagesGallery.length > 0) {
    const first = product.imagesGallery[0]
    const firstImg = typeof first === 'object' ? first?.image || first : first
    if (typeof firstImg === 'string' && firstImg.startsWith('http')) return firstImg
    if (typeof firstImg === 'object' && firstImg?.url) return firstImg.url
  }

  return null
}

// 🎯 Fast ID lookup helper with depth: 1 and fallbackLocale: 'en'
async function fetchProductById(id: string, locale: string, payload: any) {
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : id

  // 1. Try 'products' collection
  try {
    const product = await payload.findByID({
      collection: 'products',
      id: numericId,
      locale,
      fallbackLocale: 'en', // 🎯 Ensures missing CKB fields fallback to English
      depth: 1,
    })
    if (product) return { product, collectionName: 'products' as const }
  } catch (err) {
    // ID didn't match in products
  }

  // 2. Fallback to 'ui-products' collection
  try {
    const uiProduct = await payload.findByID({
      collection: 'ui-products',
      id: numericId,
      locale,
      fallbackLocale: 'en', // 🎯 Ensures missing CKB fields fallback to English
      depth: 1,
    })
    if (uiProduct) return { product: uiProduct, collectionName: 'ui-products' as const }
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

    const title = resolveTitle(product, currentLocale)
    const description = typeof product.description === 'string' ? product.description : ''
    const imageUrl = resolveImageUrl(product) || undefined

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

  const { product, collectionName } = result

  // 🎯 Extract unified title & image URL
  const productTitle = resolveTitle(product, currentLocale)
  const featuredImageUrl = resolveImageUrl(product)

  // 🎯 Completely safe category object resolution
  const categoryObject = product?.category || product?.uiCategory || null
  const categoryId =
    typeof categoryObject === 'object' && categoryObject !== null
      ? categoryObject.id
      : categoryObject

  // 🎯 Safe related products lookup
  let relatedDocs: any[] = []

  if (categoryId) {
    const targetCollection = collectionName === 'ui-products' ? 'ui-products' : 'products'
    const categoryKey =
      collectionName === 'ui-products' && product?.uiCategory ? 'uiCategory' : 'category'

    try {
      const relatedData = await payload.find({
        collection: targetCollection,
        locale: currentLocale as 'en' | 'ar' | 'ckb',
        fallbackLocale: 'en', // 🎯 Added fallback locale here as well
        where: {
          and: [{ [categoryKey]: { equals: categoryId } }, { id: { not_equals: product.id } }],
        },
        limit: 4,
      })
      relatedDocs = relatedData.docs || []
    } catch (err) {
      console.error('Failed fetching related products:', err)
    }
  }

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  const mainPriceSpecs = calculateProductPrice({
    ...product,
    title: productTitle,
    hasDiscount: product.hasDiscount ?? false,
  } as any)

  const productCategoryName =
    categoryObject && typeof categoryObject === 'object'
      ? resolveTitle(categoryObject, currentLocale)
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

  // Ensure normalized product payload passed to InfoSidebar
  const normalizedProduct = {
    ...product,
    title: productTitle,
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
            title={productTitle}
            featuredImageUrl={featuredImageUrl}
            imagesGallery={product.imagesGallery}
            isRtl={isRtl}
            currentLocale={currentLocale}
            isDiscounted={mainPriceSpecs.isDiscounted}
            badgeText={mainPriceSpecs.badgeText || ''}
            technicalSpecs={product.technicalSpecs || undefined}
          />

          <ProductInfoSidebar
            product={normalizedProduct}
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
