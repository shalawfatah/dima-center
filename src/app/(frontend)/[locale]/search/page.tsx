import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@/payload.config'

import type { Metadata } from 'next'
import { SearchPageProps } from '@/types/types'
import { getSearchPageMetadata } from '@/utils/search-metadata'
import { searchProducts, MatchedProduct } from '@/utils/search-products'
import styles from '@/styles/search_page.module.css'
import { EMPTY_STATE_TEXT, HEADINGS } from '@/utils/search_dicts'

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])

  return getSearchPageMetadata({
    locale: resolvedParams.locale || 'en',
    query: resolvedSearchParams.q?.trim() || '',
  })
}

export default async function SearchResultsPage({ params, searchParams }: SearchPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])

  const currentLocale = resolvedParams.locale || 'en'
  const query = resolvedSearchParams.q?.trim() || ''
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)

  // Fetch generalSettings to get fonts + colors
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

  // Extract fonts from generalSettings
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

  let headingFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  let bodyFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  let dynamicFontFaceCSS = ''

  if (headingFontObj && typeof headingFontObj === 'object' && headingFontObj.url) {
    const fontName = `SearchHeading_${currentLocale}`
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
    const fontName = `SearchBody_${currentLocale}`
    bodyFont = `"${fontName}", "Rudaw", sans-serif`
    dynamicFontFaceCSS += `
      @font-face {
        font-family: '${fontName}';
        src: url('${fontName}') format('truetype');
        font-display: swap;
      }
    `
  }

  // 🎯 Extract exact colors matching the rest of the application
  const titleColor = typography?.titleColor || undefined
  const bodyColor = typography?.bodyColor || undefined
  const boxTitleColor = typography?.boxTitleColor || undefined
  const boxBodyColor = typography?.boxBodyColor || undefined
  const boxPriceColor = typography?.boxPriceColor || undefined
  const boxBgColor = typography?.boxBackgroundColor || undefined
  const boxBorderColor = typography?.boxBorderColor || undefined

  const resolvedSearchTitleColor = boxTitleColor || titleColor || '#000000'
  const resolvedSearchBodyColor = boxBodyColor || bodyColor || '#333333'
  const resolvedSearchPriceColor = boxPriceColor || resolvedSearchBodyColor

  const matchedProducts: MatchedProduct[] = await searchProducts(query, currentLocale)

  return (
    <>
      {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}

      <div
        className={styles.page}
        dir={isRtl ? 'rtl' : 'ltr'}
        style={
          {
            '--search-heading-font': headingFont,
            '--search-body-font': bodyFont,
            '--search-title-color': resolvedSearchTitleColor,
            '--search-body-color': resolvedSearchBodyColor,
            '--search-price-color': resolvedSearchPriceColor,
            '--search-card-bg': boxBgColor || '#ffffff',
            '--search-border-color': boxBorderColor || '#eee',
          } as React.CSSProperties
        }
      >
        <main className={styles.main}>
          <h1
            className={styles.heading}
            style={{
              fontFamily: 'var(--search-heading-font)',
              fontWeight: 'bold',
              color: 'var(--search-title-color)',
            }}
          >
            {HEADINGS[currentLocale] || HEADINGS.en}{' '}
            <span className={styles.highlight}>"{query}"</span>
          </h1>

          {matchedProducts.length === 0 ? (
            <div
              className={styles.emptyState}
              style={{
                fontFamily: 'var(--search-body-font)',
                color: 'var(--search-body-color)',
              }}
            >
              🔍 Telephone booth empty... {EMPTY_STATE_TEXT[currentLocale] || EMPTY_STATE_TEXT.en}
            </div>
          ) : (
            <div className={styles.grid}>
              {matchedProducts.map((product, index) => {
                const hasImage = product.featuredImage && typeof product.featuredImage === 'object'
                const imageUrl = hasImage ? product.featuredImage.url : null

                const productIdentifier = product.slug || product.id
                const productHref = `/${currentLocale}/${product.categorySlug}/${productIdentifier}`

                return (
                  <Link key={product.id} href={productHref} className={styles.cardLink}>
                    <div className={styles.card}>
                      <span
                        className={styles.index}
                        style={{
                          fontFamily: 'var(--search-body-font)',
                          color: 'var(--search-body-color)',
                        }}
                      >
                        #{index + 1}
                      </span>

                      <div className={styles.imageWrapper}>
                        {imageUrl ? (
                          <Image
                            height={80}
                            width={80}
                            sizes="80px"
                            src={imageUrl}
                            alt={product.title}
                            className={styles.image}
                          />
                        ) : (
                          <span
                            className={styles.imagePlaceholder}
                            style={{ fontFamily: 'var(--search-body-font)' }}
                          >
                            📦
                          </span>
                        )}
                      </div>

                      <div className={styles.details}>
                        {product.category && (
                          <span
                            className={styles.category}
                            style={{
                              fontFamily: 'var(--search-body-font)',
                              color: 'var(--search-body-color)',
                            }}
                          >
                            {product.category}
                          </span>
                        )}
                        <h3
                          className={styles.title}
                          style={{
                            fontFamily: 'var(--search-heading-font)',
                            fontWeight: '600',
                            color: 'var(--search-title-color)',
                          }}
                        >
                          {product.title}
                        </h3>
                        {product.descriptionSnippet && (
                          <p
                            className={styles.description}
                            style={{
                              fontFamily: 'var(--search-body-font)',
                              color: 'var(--search-body-color)',
                            }}
                          >
                            {product.descriptionSnippet}
                          </p>
                        )}
                      </div>

                      <div className={styles.priceBlock}>
                        <div
                          className={styles.price}
                          style={{
                            fontFamily: 'var(--search-body-font)',
                            fontWeight: 'bold',
                            color: 'var(--search-price-color)',
                          }}
                        >
                          ${product.price}
                        </div>
                        {product.condition && (
                          <span
                            className={styles.condition}
                            style={{
                              fontFamily: 'var(--search-body-font)',
                              color: 'var(--search-body-color)',
                              backgroundColor: 'transparent',
                              border: `1px solid var(--search-title-color)`,
                            }}
                          >
                            {product.condition.replace('_', ' ')}
                          </span>
                        )}
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
