import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'

interface SearchPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function SearchResultsPage({ params, searchParams }: SearchPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const currentLocale = resolvedParams.locale || 'en'
  const query = resolvedSearchParams.q?.trim() || ''

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const payload = await getPayload({ config })

  let matchedProducts: any[] = []

  if (query) {
    // 🎯 Fix: Use 'contains' instead of 'like' for case-insensitive database matching in Payload
    const orConditions: any[] = [
      { title: { contains: query } },
      { description: { contains: query } },
    ]

    const searchData = await payload.find({
      collection: 'products',
      locale: currentLocale as 'en' | 'ar' | 'ckb',
      where: {
        or: orConditions,
      },
      limit: 50,
    })

    matchedProducts = [...searchData.docs].sort((a, b) => {
      const q = query.toLowerCase()
      const aTitle = (a.title || '').toLowerCase()
      const bTitle = (b.title || '').toLowerCase()

      // Safe evaluation extracting the title string whether category is populated or an ID
      const getCategoryString = (product: any): string => {
        if (!product.category) return ''
        if (typeof product.category === 'object') {
          return (product.category.title || product.category.slug || '').toLowerCase()
        }
        return String(product.category).toLowerCase()
      }

      const aCat = getCategoryString(a)
      const bCat = getCategoryString(b)

      // Priority 1: Category match
      if (aCat === q && bCat !== q) return -1
      if (bCat === q && aCat !== q) return 1

      // Priority 2: Title starts with the query phrase
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
      <main style={{ flex: '1', padding: '3rem max(1.5rem, calc((100% - 1200px)/2))' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem' }}>
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
            🔍{' '}
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
              const imageUrl = hasImage ? (product.featuredImage as any).url : null

              // 🎯 Safe Render check: Extracts a string safely from the Category relational object
              const displayCategory =
                product.category && typeof product.category === 'object'
                  ? product.category.title || product.category.slug
                  : product.category

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
                      transition: 'transform 0.15s ease',
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
                        height: '80px',
                        background: '#f4f6f8',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.title}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '20px' }}>📦</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          color: '#0070f3',
                          fontWeight: '700',
                        }}
                      >
                        {displayCategory}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', margin: '2px 0 6px 0', fontWeight: '600' }}>
                        {product.title}
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
                        {product.description}
                      </p>
                    </div>

                    <div style={{ textAlign: isRtl ? 'left' : 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#000' }}>
                        ${product.price}
                      </div>
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
                        {product.condition}
                      </span>
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
