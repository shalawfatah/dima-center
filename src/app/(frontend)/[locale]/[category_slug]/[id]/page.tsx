import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { calculateProductPrice } from '@/utils/price'
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb'
import ProductMediaColumn from '@/components/product/ProductMediaColumn'
import ProductInfoSidebar from '@/components/product/ProductInfoSidebar'
import RelatedProducts from '@/components/product/RelatedProducts'
import styles from '@/styles/product-detail.module.css'
import { ProductPageProps } from '@/types/types'
import { resolveTitle } from '@/utils/resolve_title'
import { fetchProductById } from '@/utils/fetch_product_by_id'
import { resolveImageUrl } from '@/utils/resolve_image_url_single_product'

import { generateProductMetadata as generateMetadata } from './generate-metadata'
export { generateMetadata }

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
  const boxBorderColor = settings?.typography?.boxBorderColor || undefined

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
          and: [
            { [categoryKey]: { equals: categoryId } },
            { id: { not_equals: product.id } },
            // 👇 Add this condition to exclude out-of-stock items
            { stock: { greater_than: 0 } },
          ],
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
              borderColor={boxBorderColor}
            />

            <ProductInfoSidebar
              product={normalizedProduct}
              currentLocale={currentLocale}
              isRtl={isRtl}
              finalPrice={usdPriceNum}
              originalPrice={usdOriginalNum}
              isDiscounted={mainPriceSpecs.isDiscounted}
              iqdPrice={iqdPriceNum}
              borderColor={boxBorderColor}
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
            borderColor={boxBorderColor}
          />
        </main>
      </div>
    </>
  )
}
