import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'

import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'

interface SearchPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; [key: string]: any }>
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])

  const locale = resolvedParams.locale || 'en'
  const query = resolvedSearchParams.q?.trim() || ''

  const baseMeta = await getStorefrontMetadata({ locale })

  const titles: Record<string, string> = {
    en: query ? `Search results for "${query}"` : 'Search Products',
    ar: query ? `نتائج البحث عن "${query}"` : 'البحث عن المنتجات',
    ckb: query ? `ئەنجامەکانی گەڕان بۆ "${query}"` : 'گەڕان بۆ بەرهەمەکان',
  }

  const descriptions: Record<string, string> = {
    en: `Browse results matching "${query}" on our marketplace.`,
    ar: `تصفح النتائج المطابقة لـ "${query}" في متجرنا.`,
    ckb: `سەیری ئەو ئەنجامانە بکە کە دەطابن لەگەڵ "${query}" لە کۆگاکەماندا.`,
  }

  const finalTitle = titles[locale] || titles.en
  const finalDescription = descriptions[locale] || descriptions.en

  return {
    ...baseMeta,
    title: finalTitle,
    description: finalDescription,
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      ...baseMeta?.openGraph,
      title: finalTitle,
      description: finalDescription,
    },
  }
}

export default async function SearchResultsPage({ params, searchParams }: SearchPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])

  const currentLocale = resolvedParams.locale || 'en'
  const query = resolvedSearchParams.q?.trim() || ''
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  let matchedProducts: any[] = []

  if (query) {
    const payload = await getPayload({ config })

    const searchData = await payload.find({
      collection: 'products',
      // FIX: Query 'all' locales so Payload leaves the raw localized data structure intact.
      // This stops Payload from dropping ckb values when browsing in en or ar.
      locale: 'all',
      where: {
        or: [
          // Explicit cross-locale text searches for product titles and descriptions
          { 'title.en': { contains: query } },
          { 'title.ar': { contains: query } },
          { 'title.ckb': { contains: query } },
          { 'description.en': { contains: query } },
          { 'description.ar': { contains: query } },
          { 'description.ckb': { contains: query } },

          // Explicit cross-locale relational queries for categories
          { 'category.title.en': { contains: query } },
          { 'category.title.ar': { contains: query } },
          { 'category.title.ckb': { contains: query } },
          { 'category.slug': { contains: query } },
        ],
      },
      depth: 2,
      limit: 50,
    })

    const q = query.toLowerCase()

    matchedProducts = searchData.docs
      .map((doc: any) => {
        const rawTitle = doc.title || doc.name || ''
        let displayTitle = ''

        // FIX: Prioritize current runtime locale, then fallback directly to 'ckb', then others.
        if (typeof rawTitle === 'object' && rawTitle !== null) {
          displayTitle =
            rawTitle[currentLocale] ||
            rawTitle['ckb'] ||
            rawTitle['en'] ||
            rawTitle['ar'] ||
            Object.values(rawTitle)[0] ||
            ''
        } else {
          displayTitle = String(rawTitle)
        }

        let rawDescription = doc.description || ''
        if (typeof rawDescription === 'object' && rawDescription !== null) {
          rawDescription =
            rawDescription[currentLocale] ||
            rawDescription['ckb'] ||
            rawDescription['en'] ||
            rawDescription['ar'] ||
            ''
        }

        let textSnippet = ''
        try {
          if (typeof rawDescription === 'string') {
            textSnippet = rawDescription
          } else if (rawDescription?.root?.children) {
            textSnippet = rawDescription.root.children
              .map((ch: any) => ch.children?.map((g: any) => g.text).join('') || '')
              .join(' ')
          }
        } catch {
          textSnippet = ''
        }

        let finalCategoryString = ''
        if (doc.category) {
          if (typeof doc.category === 'object' && doc.category !== null) {
            const rawCatTitle = doc.category.title || doc.category.name || ''
            if (typeof rawCatTitle === 'object' && rawCatTitle !== null) {
              finalCategoryString =
                rawCatTitle[currentLocale] ||
                rawCatTitle['ckb'] ||
                rawCatTitle['en'] ||
                rawCatTitle['ar'] ||
                Object.values(rawCatTitle)[0] ||
                ''
            } else {
              finalCategoryString = String(rawCatTitle)
            }
          } else {
            finalCategoryString = String(doc.category)
          }
        }

        return {
          id: doc.id,
          price: doc.price,
          condition: doc.condition,
          category: finalCategoryString,
          featuredImage: doc.featuredImage,
          title: displayTitle,
          descriptionSnippet: textSnippet,
        }
      })
      .sort((a, b) => {
        const aTitle = String(a.title).toLowerCase()
        const bTitle = String(b.title).toLowerCase()

        if (aTitle.startsWith(q) && !bTitle.startsWith(q)) return -1
        if (bTitle.startsWith(q) && !aTitle.startsWith(q)) return 1
        return 0
      })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        direction: isRtl ? 'rtl' : 'ltr',
        backgroundColor: '#fafafa',
      }}
    >
      <main style={{ flex: '1', padding: '3rem max(1.5rem, calc((100% - 1800px)/2))' }}>
        <h1
          style={{
            fontFamily: 'Rudaw',
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#000',
          }}
        >
          {currentLocale === 'ar'
            ? 'نتائج البحث عن:'
            : currentLocale === 'ckb'
              ? 'ئەنجامەکانی گەڕان بۆ:'
              : 'Search Results for:'}{' '}
          <span style={{ color: '#0070f3' }}>"{query}"</span>
        </h1>

        {matchedProducts.length === 0 ? (
          <div
            style={{
              background: '#fff',
              border: '1px solid #eef0f2',
              borderRadius: '12px',
              padding: '4rem 2rem',
              textAlign: 'center',
              color: '#666',
            }}
          >
            🔍 Telephone booth empty...{' '}
            {currentLocale === 'ar'
              ? 'لم نجد أي نتائج تطابق بحثك.'
              : currentLocale === 'ckb'
                ? 'هیچ ئەنجامێک نەدۆزرایەوە.'
                : 'No items matched your search criteria.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {matchedProducts.map((product, index) => {
              const hasImage = product.featuredImage && typeof product.featuredImage === 'object'
              const imageUrl = hasImage ? product.featuredImage.url : null
              const displayTitle = product.title

              return (
                <Link
                  key={product.id}
                  href={`/${currentLocale}/products/${product.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      background: '#fff',
                      border: '1px solid #eef0f2',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      gap: '1.5rem',
                      alignItems: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#aaa',
                        minWidth: '20px',
                      }}
                    >
                      #{index + 1}
                    </span>

                    <div
                      style={{
                        width: '80px',
                        position: 'relative',
                        height: '80px',
                        background: '#f4f6f8',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {imageUrl ? (
                        <Image
                          fill
                          sizes="80px"
                          src={imageUrl}
                          alt={displayTitle}
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '20px' }}>📦</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      {product.category && (
                        <span
                          style={{
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            color: '#0070f3',
                            fontWeight: '700',
                          }}
                        >
                          {product.category}
                        </span>
                      )}
                      <h3
                        style={{
                          fontSize: '1.15rem',
                          margin: '2px 0 6px 0',
                          fontWeight: '600',
                          color: '#000',
                        }}
                      >
                        {displayTitle}
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#666',
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.descriptionSnippet}
                      </p>
                    </div>

                    <div style={{ textAlign: isRtl ? 'left' : 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#000' }}>
                        ${product.price}
                      </div>
                      {product.condition && (
                        <span
                          style={{
                            fontSize: '11px',
                            background: '#f0fdf4',
                            color: '#16a34a',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
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
  )
}
