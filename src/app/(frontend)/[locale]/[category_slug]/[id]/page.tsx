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

function resolveTitle(product: any, locale: string): string {
  if (!product) return 'Untitled Product'

  let titleProp =
    product.title || product.name || product.productName || product.label || product.title_en

  if (!titleProp) return 'Untitled Product'

  if (typeof titleProp === 'string' && titleProp.trim().startsWith('{')) {
    try {
      titleProp = JSON.parse(titleProp)
    } catch {}
  }

  if (typeof titleProp === 'string' && titleProp.trim() !== '') {
    return titleProp.trim()
  }

  if (typeof titleProp === 'object' && titleProp !== null) {
    if (titleProp.root || Array.isArray(titleProp.children)) {
      try {
        const children = titleProp.root?.children || titleProp.children || []
        const text = children
          .map((c: any) => c.text || c.children?.map((tc: any) => tc.text).join('') || '')
          .join(' ')
          .trim()
        if (text) return text
      } catch {}
    }

    const match =
      titleProp[locale] ||
      titleProp.en ||
      titleProp.ar ||
      titleProp.ckb ||
      Object.values(titleProp).find((v) => typeof v === 'string' && v.trim() !== '')

    if (typeof match === 'string' && match.trim() !== '') {
      return match.trim()
    }
  }

  return 'Untitled Product'
}

function resolveImageUrl(product: any): string | null {
  if (!product) return null

  const img = product.image
  if (typeof img === 'string' && img.startsWith('http')) return img
  if (typeof img === 'object' && img?.url) return img.url

  const featured = product.featuredImage
  if (typeof featured === 'string' && featured.startsWith('http')) return featured
  if (typeof featured === 'object' && featured?.url) return featured.url

  if (Array.isArray(product.imagesGallery) && product.imagesGallery.length > 0) {
    const first = product.imagesGallery[0]
    const firstImg = typeof first === 'object' ? first?.image || first : first
    if (typeof firstImg === 'string' && firstImg.startsWith('http')) return firstImg
    if (typeof firstImg === 'object' && firstImg?.url) return firstImg.url
  }

  return null
}

async function fetchProductById(id: string, locale: string, payload: any) {
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : id

  try {
    const product = await payload.findByID({
      collection: 'products',
      where: { stock: { greater_than: 0 } },
      id: numericId,
      locale,
      fallbackLocale: 'ckb',
      depth: 1,
    })
    if (product) return { product, collectionName: 'products' as const }
  } catch (err) {}

  try {
    const uiProduct = await payload.findByID({
      collection: 'ui-products',
      id: numericId,
      locale,
      fallbackLocale: 'ckb',
      depth: 1,
    })
    if (uiProduct) return { product: uiProduct, collectionName: 'ui-products' as const }
  } catch (err) {}

  return null
}

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
      depth: 1,
    })
  } catch (err) {
    console.error('Failed fetching general settings config', err)
  }
  const exchangeRate = settings?.exchangeRate || 1500
  const boxBgColor = settings?.typography?.boxBackgroundColor || undefined

  // 🎯 Extract titleColor and bodyColor from settings
  const titleColor = settings?.typography?.titleColor || undefined
  const bodyColor = settings?.typography?.bodyColor || undefined

  // Extract fonts
  const typography = settings?.typography
  const localeMap = {
    ckb: 'kurdish',
    ar: 'arabic',
    en: 'english',
  } as const

  const fontGroupKey = localeMap[currentLocale as keyof typeof localeMap]
  const fontGroup = typography?.[fontGroupKey]

  const headingFontObj = fontGroup?.headingFont
  const bodyFontObj = fontGroup?.bodyFont

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)

  let headingFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  let bodyFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  let dynamicFontFaceCSS = ''

  if (headingFontObj && typeof headingFontObj === 'object' && headingFontObj.url) {
    const fontName = `ProductHeading_${currentLocale}`
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
    const fontName = `ProductBody_${currentLocale}`
    bodyFont = `"${fontName}", "Rudaw", sans-serif`
    dynamicFontFaceCSS += `
      @font-face {
        font-family: '${fontName}';
        src: url('${bodyFontObj.url}') format('truetype');
        font-display: swap;
      }
    `
  }

  const result = await fetchProductById(productId, currentLocale, payload)

  if (!result) {
    return notFound()
  }

  const { product, collectionName } = result

  const productTitle = resolveTitle(product, currentLocale)
  const featuredImageUrl = resolveImageUrl(product)

  const categoryObject = product?.category || product?.uiCategory || null
  const categoryId =
    typeof categoryObject === 'object' && categoryObject !== null
      ? categoryObject.id
      : categoryObject

  let relatedDocs: any[] = []

  if (categoryId) {
    const targetCollection = collectionName === 'ui-products' ? 'ui-products' : 'products'
    const categoryKey =
      collectionName === 'ui-products' && product?.uiCategory ? 'uiCategory' : 'category'

    try {
      const relatedData = await payload.find({
        collection: targetCollection,
        locale: currentLocale as 'en' | 'ar' | 'ckb',
        fallbackLocale: 'ckb',
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

  const normalizedProduct = {
    ...product,
    title: productTitle,
  }

  return (
    <>
      {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}

      <div
        style={
          {
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            direction: isRtl ? 'rtl' : 'ltr',
            backgroundColor: 'var(--brand-background)',
            '--product-heading-font': headingFont,
            '--product-body-font': bodyFont,
            '--product-title-color': titleColor || '#000000',
            '--product-body-color': bodyColor || '#333333',
          } as React.CSSProperties
        }
      >
        <main
          style={{
            backgroundColor: 'var(--brand-background)',
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
              cardBgColor={boxBgColor}
              headingFont={headingFont}
              bodyFont={bodyFont}
              titleColor={titleColor}
              bodyColor={bodyColor}
            />

            <ProductInfoSidebar
              product={normalizedProduct}
              currentLocale={currentLocale}
              isRtl={isRtl}
              finalPrice={usdPriceNum}
              originalPrice={usdOriginalNum}
              isDiscounted={mainPriceSpecs.isDiscounted}
              iqdPrice={iqdPriceNum}
              cardBgColor={boxBgColor}
              headingFont={headingFont}
              bodyFont={bodyFont}
              dynamicFontFaceCSS={dynamicFontFaceCSS}
              titleColor={titleColor}
              bodyColor={bodyColor}
            />
          </div>

          <RelatedProducts
            items={relatedDocs}
            currentLocale={currentLocale}
            isRtl={isRtl}
            exchangeRate={exchangeRate}
            cardBgColor={boxBgColor}
            headingFont={headingFont}
            bodyFont={bodyFont}
            dynamicFontFaceCSS={dynamicFontFaceCSS}
            titleColor={titleColor}
            bodyColor={bodyColor}
          />
        </main>
      </div>
    </>
  )
}
