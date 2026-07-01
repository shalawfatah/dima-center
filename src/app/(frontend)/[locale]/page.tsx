import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FilterSidebar from '@/components/FilterSidebar'
import { calculateProductPrice } from '@/utils/price'
import PromoCarousel from '@/components/PromoCarousel'
import NavUserMenu from '@/components/NavUserMenu'
import Image from 'next/image'

import logoImg from '../../../../public/media/logo.png'
import { search_styles } from '@/styles/search_styles'
import Languages from '@/components/Languages'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    category?: string
    condition?: string
    maxPrice?: string
    sort?: string
    [key: string]: any
  }>
}

// 🛠️ DYNAMIC FACETS CALCULATOR
async function getFilterFacets(categorySlug?: string, locale: string = 'en') {
  const payload = await getPayload({ config })

  const baseData = await payload.find({
    collection: 'products',
    locale: locale as any,
    where: categorySlug ? { 'category.slug': { equals: categorySlug } } : undefined,
    limit: 100,
  })

  const conditions = new Set<string>()
  const dynamicSpecs: Record<string, Set<string>> = {}
  let minPrice = Infinity
  let maxPrice = -Infinity

  baseData.docs.forEach((product) => {
    if (product.condition) conditions.add(product.condition)
    if (product.price < minPrice) minPrice = product.price
    if (product.price > maxPrice) maxPrice = product.price

    if (product.technicalSpecs) {
      product.technicalSpecs.forEach((spec: any) => {
        if (!spec.key || !spec.value) return
        if (!dynamicSpecs[spec.key]) dynamicSpecs[spec.key] = new Set<string>()
        dynamicSpecs[spec.key].add(spec.value)
      })
    }
  })

  const flatSpecs: Record<string, string[]> = {}
  Object.keys(dynamicSpecs).forEach((key) => {
    flatSpecs[key] = Array.from(dynamicSpecs[key])
  })

  return {
    conditions: Array.from(conditions),
    minPrice: minPrice === Infinity ? 0 : minPrice,
    maxPrice: maxPrice === -Infinity ? 3000 : maxPrice,
    dynamicSpecs: flatSpecs,
  }
}

export default async function StorefrontHome({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const currentLocale = resolvedParams.locale || 'en'
  const { category, condition, maxPrice, sort } = resolvedSearchParams
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  const payload = await getPayload({ config })

  const andConditions: any[] = []

  if (category) {
    andConditions.push({ 'category.slug': { equals: category } })
  }

  // Product Condition Filtering Array Matcher
  if (condition && typeof condition === 'string' && condition.trim() !== '') {
    const conditionArray = condition
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
    if (conditionArray.length > 0) {
      andConditions.push({ condition: { in: conditionArray } })
    }
  }

  // Maximum Price Ceiling Boundaries
  if (maxPrice && !isNaN(Number(maxPrice))) {
    andConditions.push({ price: { less_than_equal: Number(maxPrice) } })
  }

  // Custom Specs Array Key-Value Matrix Evaluator
  Object.keys(resolvedSearchParams).forEach((paramKey) => {
    if (paramKey.startsWith('spec_') && resolvedSearchParams[paramKey]) {
      const actualSpecKey = paramKey.replace('spec_', '')
      const paramValue = resolvedSearchParams[paramKey]

      if (typeof paramValue === 'string' && paramValue.trim() !== '') {
        const selectedValues = paramValue
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)

        if (selectedValues.length > 0) {
          andConditions.push({
            or: selectedValues.map((val) => ({
              and: [
                { 'technicalSpecs.key': { equals: actualSpecKey } },
                { 'technicalSpecs.value': { equals: val } },
              ],
            })),
          })
        }
      }
    }
  })

  const finalSortString = sort === 'price_desc' ? '-price' : 'price'
  const completeWhereQuery = andConditions.length > 0 ? { and: andConditions } : undefined

  const productsData = await payload.find({
    collection: 'products',
    locale: currentLocale as 'en' | 'ar' | 'ckb',
    where: completeWhereQuery,
    sort: finalSortString,
    limit: 50,
  })

  const facets = await getFilterFacets(category, currentLocale)

  // Fetch Category details by SLUG to resolve dynamic titles on custom layouts
  let activeCategoryTitle = category || ''
  if (category) {
    try {
      const catDocs = await payload.find({
        collection: 'categories',
        where: { slug: { equals: category } },
        locale: currentLocale as any,
        limit: 1,
      })
      if (catDocs.docs.length > 0) {
        const catDoc = catDocs.docs[0]
        activeCategoryTitle = catDoc.title || catDoc.name || category
      }
    } catch (e) {
      console.error('Failed to resolve category title:', e)
    }
  }

  return (
    <div
      style={{
        fontFamily:
          '"Sarchia", sans-serif' /* 🌟 Injected Sarchia as default base body font layout stack */,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        direction: isRtl ? 'rtl' : 'ltr',
        backgroundColor: '#fff',
      }}
    >
      <style>{search_styles()}</style>
      <header className="master-header">
        <div className="top-nav-bar">
          <Link
            href={`/${currentLocale}`}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          >
            <Image src={logoImg} alt="Dima Logo" width={100} height={60} priority />
          </Link>
          <form action={`/${currentLocale}`} method="GET" className="search-form-wrapper">
            <input
              type="text"
              name="search"
              placeholder={
                currentLocale === 'ar'
                  ? 'ابحث عن قطع ومكونات...'
                  : currentLocale === 'ckb'
                    ? 'گەڕان بۆ پارچەکان...'
                    : 'Search hardware components...'
              }
              className="search-input-field"
              style={{ fontFamily: '"Sarchia", sans-serif' }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                top: '50%',
                right: isRtl ? 'auto' : '12px',
                left: isRtl ? '12px' : 'auto',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          {/* PROFILE USER MENU & LANGUAGE SELECTOR GROUP */}
          <div className="actions-cluster">
            <NavUserMenu currentLocale={currentLocale} />
            <Languages currentLocale={currentLocale} />
          </div>
        </div>

        {/* LINE 2: Independent Main Navigation links bar */}
        <div className="independent-nav-row">
          <Navbar currentLocale={currentLocale} activeCategory={category} />
        </div>
      </header>

      <PromoCarousel currentLocale={currentLocale} />

      <main style={{ flex: '1', padding: '2.5rem max(1.5rem, calc((100% - 1200px)/2))' }}>
        <div className="archive-layout-container">
          {category && (
            <div className="sidebar-wrapper">
              <FilterSidebar locale={currentLocale} facets={facets} />
            </div>
          )}

          <div style={{ flex: '1', minWidth: '0' }}>
            <h2
              style={{
                fontFamily: '"Rudaw", sans-serif' /* 🌟 Headings use Rudaw */,
                color: '#1e293b',
                fontSize: '1.65rem',
                marginBottom: '1.5rem',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
            >
              {category
                ? `${activeCategoryTitle}`
                : currentLocale === 'en'
                  ? 'Featured Hardware Items'
                  : currentLocale === 'ar'
                    ? 'القطع والمنتجات المتوفرة'
                    : 'کاڵا و پارچە بەردەستەکان'}
            </h2>

            {productsData.docs.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #eef0f2',
                  borderRadius: '12px',
                  padding: '4rem 1rem',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                📦{' '}
                {currentLocale === 'ckb'
                  ? 'هیچ کاڵایەک نەدۆزرایەوە بۆ ئەم فلتەرانە.'
                  : 'No items found matching these criteria.'}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {productsData.docs.map((product) => {
                  const hasImage =
                    product.featuredImage && typeof product.featuredImage === 'object'
                  const imageUrl = hasImage ? (product.featuredImage as any).url : null
                  const imageAlt = hasImage ? (product.featuredImage as any).alt : product.title

                  const productCategoryName =
                    product.category && typeof product.category === 'object'
                      ? (product.category as any).title || (product.category as any).name
                      : ''

                  const { isDiscounted, originalPrice, finalPrice, badgeText } =
                    calculateProductPrice(product)

                  return (
                    <Link
                      key={product.id}
                      href={`/${currentLocale}/products/${product.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
                    >
                      <div
                        className="product-card"
                        style={{
                          border: '1px solid #eef0f2',
                          borderRadius: '12px',
                          background: '#fff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%',
                          position: 'relative',
                        }}
                      >
                        {isDiscounted && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: isRtl ? 'auto' : '12px',
                              right: isRtl ? '12px' : 'auto',
                              background: '#ef4444',
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              zIndex: 10,
                            }}
                          >
                            {badgeText}{' '}
                            {currentLocale === 'ar'
                              ? 'خصم'
                              : currentLocale === 'ckb'
                                ? 'داشکانـدن'
                                : 'OFF'}
                          </span>
                        )}

                        <div
                          style={{
                            width: '100%',
                            height: '200px',
                            background: '#f8fafc',
                            position: 'relative',
                            borderBottom: '1px solid #eef0f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={imageAlt}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                padding: '10px',
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '42px' }}>📦</span>
                          )}
                        </div>

                        <div
                          style={{
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            flex: '1',
                          }}
                        >
                          {productCategoryName && (
                            <span
                              style={{
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                color: '#0070f3',
                                fontWeight: '700',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {productCategoryName}
                            </span>
                          )}
                          <h3
                            style={{
                              fontFamily:
                                '"Rudaw", sans-serif' /* 🌟 Structural headers take Rudaw */,
                              color: '#1e293b',
                              margin: '0.4rem 0',
                              fontSize: '1.15rem',
                              fontWeight: '600',
                            }}
                          >
                            {product.title}
                          </h3>
                          <p
                            style={{
                              color: '#475569',
                              fontSize: '14px',
                              margin: '0 0 1.25rem 0',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.4',
                            }}
                          >
                            {product.description}
                          </p>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: 'auto',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              {isDiscounted ? (
                                <>
                                  <span
                                    style={{
                                      fontSize: '12px',
                                      textDecoration: 'line-through',
                                      color: '#94a3b8',
                                      fontWeight: '500',
                                    }}
                                  >
                                    ${originalPrice}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '1.4rem',
                                      fontWeight: '800',
                                      color: '#ef4444',
                                    }}
                                  >
                                    ${finalPrice}
                                  </span>
                                </>
                              ) : (
                                <span
                                  style={{
                                    fontSize: '1.4rem',
                                    fontWeight: '800',
                                    color: '#0f172a',
                                  }}
                                >
                                  ${originalPrice}
                                </span>
                              )}
                            </div>

                            <span
                              style={{
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                background: '#f0fdf4',
                                color: '#16a34a',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontWeight: '700',
                              }}
                            >
                              {product.condition?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer currentLocale={currentLocale} />
    </div>
  )
}
