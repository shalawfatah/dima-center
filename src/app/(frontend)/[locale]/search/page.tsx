import Link from 'next/link'
import Image from 'next/image'

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

  const matchedProducts: MatchedProduct[] = await searchProducts(query, currentLocale)

  return (
    <div className={styles.page} dir={isRtl ? 'rtl' : 'ltr'}>
      <main className={styles.main}>
        <h1 className={styles.heading}>
          {HEADINGS[currentLocale] || HEADINGS.en}{' '}
          <span className={styles.highlight}>"{query}"</span>
        </h1>

        {matchedProducts.length === 0 ? (
          <div className={styles.emptyState}>
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
                    <span className={styles.index}>#{index + 1}</span>

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
                        <span className={styles.imagePlaceholder}>📦</span>
                      )}
                    </div>

                    <div className={styles.details}>
                      {product.category && (
                        <span className={styles.category}>{product.category}</span>
                      )}
                      <h3 className={styles.title}>{product.title}</h3>
                      {product.descriptionSnippet && (
                        <p className={styles.description}>{product.descriptionSnippet}</p>
                      )}
                    </div>

                    <div className={styles.priceBlock}>
                      <div className={styles.price}>${product.price}</div>
                      {product.condition && (
                        <span className={styles.condition}>
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
  )
}
