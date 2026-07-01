import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'

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
    // 🎯 FIX: Only query flat localized text fields to prevent Payload's JSON QueryError
    const orConditions: any[] = [
      { 'title.en': { contains: query } },
      { 'title.ar': { contains: query } },
      { 'title.ckb': { contains: query } },
    ]

    const searchData = await payload.find({
      collection: 'products',
      // 🎯 FIX: Pull the entire locale matrix to cross-match entries safely
      locale: 'all',
      where: {
        or: orConditions,
      },
      limit: 50,
    })

    matchedProducts = [...searchData.docs].sort((a, b) => {
      const q = query.toLowerCase()

      // Extract the correct string for the active locale or fall back to English
      const aTitle = String(a.title?.[currentLocale] || a.title?.en || '').toLowerCase()
      const bTitle = String(b.title?.[currentLocale] || b.title?.en || '').toLowerCase()

      const getCategoryString = (product: any): string => {
        if (!product.category) return ''
        if (typeof product.category === 'object') {
          const target =
            product.category.title || product.category.slug || product.category.name || ''
          return (
            typeof target === 'object' ? target[currentLocale] || target.en || '' : String(target)
          ).toLowerCase()
        }
        return String(product.category).toLowerCase()
      }

      const aCat = getCategoryString(a)
      const bCat = getCategoryString(b)

      if (aCat === q && bCat !== q) return -1
      if (bCat === q && aCat !== q) return 1

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

              // 🎯 Get current localized title or fall back safely
              const displayTitle = product.title?.[currentLocale] || product.title?.en || ''

              // 🎯 Safe Category extraction across all localized variants
              let displayCategory = ''
              if (product.category) {
                if (typeof product.category === 'object') {
                  const target =
                    product.category.title || product.category.slug || product.category.name || ''
                  displayCategory =
                    typeof target === 'object'
                      ? target[currentLocale] || target.en || ''
                      : String(target)
                } else {
                  displayCategory = String(product.category)
                }
              }

              // 🎯 Safe snippet construction based on the currently displayed locale
              let textSnippet = ''
              try {
                const localizedDesc =
                  product.description?.[currentLocale] || product.description?.en
                if (typeof localizedDesc === 'string') {
                  textSnippet = localizedDesc
                } else if (localizedDesc?.root?.children) {
                  textSnippet = localizedDesc.root.children
                    .map((ch: any) => ch.children?.map((g: any) => g.text).join('') || '')
                    .join(' ')
                }
              } catch (e) {
                textSnippet = ''
              }

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
                        <Image
                          height={200}
                          width={200}
                          src={imageUrl}
                          alt={displayTitle}
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
                        {textSnippet}
                      </p>
                    </div>

                    <div style={{ textAlign: isRtl ? 'left' : 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#000' }}>
                        {product.price} IQD
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
                        {product.condition?.replace('_', ' ')}
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
