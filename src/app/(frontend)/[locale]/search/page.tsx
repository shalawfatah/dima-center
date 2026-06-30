import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
    const cleanQuery = query.toLowerCase().trim()

    // Define the strict array of categories accepted by your Postgres enum table column
    const VALID_CATEGORIES = ['cpu', 'gpu', 'laptop', 'motherboard']
    const isQueryAValidCategory = VALID_CATEGORIES.includes(cleanQuery)

    // Build the baseline array for text fields that always support fuzzy searching
    const orConditions: any[] = [{ title: { like: query } }, { description: { like: query } }]

    // ONLY inject the category filter if the string safely matches an exact enum value
    if (isQueryAValidCategory) {
      orConditions.push({ category: { equals: cleanQuery } })
    }

    const searchData = await payload.find({
      collection: 'products',
      locale: currentLocale as 'en' | 'ar' | 'ckb',
      where: {
        or: orConditions, // Pass our safely constructed array here
      },
      limit: 50,
    }) // PRIORITY SORTING LOGIC:
    // 1. Category matches first
    // 2. Exact/Starts-with Title matches second
    // 3. Description substring matches third
    matchedProducts = [...searchData.docs].sort((a, b) => {
      const q = query.toLowerCase()
      const aTitle = (a.title || '').toLowerCase()
      const bTitle = (b.title || '').toLowerCase()
      const aCat = (a.category || '').toLowerCase()
      const bCat = (b.category || '').toLowerCase()

      // Priority 1: Category exact match
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
      <Navbar currentLocale={currentLocale} />

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
              padding: '4rem text-align',
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
                    {/* Tiny Rank Indicator Badge */}
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

                    {/* Image Thumbnail */}
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

                    {/* Meta Info */}
                    <div style={{ flex: 1 }}>
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

                    {/* Transaction Block */}
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

      <Footer currentLocale={currentLocale} />
    </div>
  )
}
