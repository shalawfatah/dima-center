import { getPayload } from 'payload'
import config from '@/payload.config'
import { calculateProductPrice } from '@/utils/price'
import PromoCarousel from '@/components/PromoCarousel'
import ProductCarousel from '@/components/ProductCarousel'
import LocalizedHeading from '@/components/LocalizedHeading'
import Link from 'next/link'
import styles from './page.module.css'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; [key: string]: any }>
}

import type { Metadata } from 'next'
import { CATEGORY_MAP } from '@/utils/categories' // Removed MAIN_CATEGORIES completely
import { getStorefrontMetadata } from '@/utils/seo'
import Image from 'next/image'
import PCBuilderSection from '@/components/PCBuilderSection'
import CategoryCarousel from '@/components/CategoryCarousel'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  return getStorefrontMetadata({ locale: resolvedParams.locale })
}

export default async function StorefrontHome({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const rawLocale = resolvedParams.locale || 'en'
  // Safely ensure we fall back to 'en' arrays if the current locale string isn't standard
  const currentLocale =
    rawLocale === 'en' || rawLocale === 'ar' || rawLocale === 'ckb' ? rawLocale : 'en'

  const activeCategory = resolvedSearchParams.category || ''
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  const payload = await getPayload({ config })

  // Extract master locale reference arrays for looking up names vs slugs
  const localCategoriesList = CATEGORY_MAP[currentLocale]
  const englishCategoriesList = CATEGORY_MAP['en']

  // -----------------------------------------------------------------
  // CONDITION A: IF A CATEGORY IS CLICKED (Show clean filtered Grid list)
  // -----------------------------------------------------------------
  if (activeCategory) {
    const matchedCatEn = CATEGORY_MAP.en.find((c) => c.slug === activeCategory)
    const matchedCatAr = CATEGORY_MAP.ar.find((c) => c.slug === activeCategory)
    const matchedCatCkb = CATEGORY_MAP.ckb.find((c) => c.slug === activeCategory)

    const res = await payload.find({
      collection: 'products',
      where: { 'category.slug': { equals: activeCategory } },
      limit: 100,
    })

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
        <main style={{ flex: '1', padding: '2rem max(1.5rem, calc((100% - 1200px)/2))' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <LocalizedHeading
              currentLocale={currentLocale}
              en={matchedCatEn?.title || 'Products'}
              ar={matchedCatAr?.title || 'المنتجات'}
              ckb={matchedCatCkb?.title || 'کاڵاکان'}
              style={{ fontSize: '1.75rem', fontWeight: '700' }}
            />
            <Link
              href={`/${currentLocale}`}
              style={{ fontSize: '14px', color: '#0070f3', textDecoration: 'none' }}
            >
              {currentLocale === 'ar'
                ? '← عرض الكل'
                : currentLocale === 'ckb'
                  ? '← پیشاندانی هەموو'
                  : '← Show All'}
            </Link>
          </div>

          {res.docs.length === 0 ? (
            <div
              style={{
                background: '#fff',
                padding: '4rem',
                textAlign: 'center',
                color: '#666',
                borderRadius: '12px',
                border: '1px solid #eef0f2',
              }}
            >
              📦{' '}
              {currentLocale === 'ar'
                ? 'لا توجد منتجات في هذه الفئة حالياً.'
                : currentLocale === 'ckb'
                  ? 'هیچ کاڵایەک لەم بەشەدا نییە.'
                  : 'No products found in this category.'}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {res.docs.map((product: any) => {
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
                        background: '#fff',
                        border: '1px solid #eef0f2',
                        borderRadius: '12px',
                        padding: '1rem',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '180px',
                          background: '#f4f6f8',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          marginBottom: '1rem',
                        }}
                      >
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            width={200}
                            height={200}
                            alt={product.title}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <span style={{ fontSize: '2rem' }}>📦</span>
                        )}
                      </div>
                      <h3
                        style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          margin: '0 0 0.5rem 0',
                          color: '#000',
                          flex: 1,
                        }}
                      >
                        {product.title}
                      </h3>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#000' }}>
                        {product.price} IQD
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

  // -----------------------------------------------------------------
  // CONDITION B: NO FILTERS ACTIVE (Default Storefront Carousels Layout)
  // -----------------------------------------------------------------
  let productsWithDiscount: any[] = []
  try {
    const fetchedDiscounts = await payload.find({
      collection: 'products',
      where: { hasDiscount: { equals: true } },
      limit: 20,
    })
    productsWithDiscount = fetchedDiscounts.docs
  } catch (err) {
    const fallbackData = await payload.find({
      collection: 'products',
      limit: 50,
    })
    productsWithDiscount = fallbackData.docs.filter(
      (p: any) => calculateProductPrice(p).isDiscounted,
    )
  }

  // Fetch products maps sequentially using the dynamic locale strings mapped across standard slugs
  const categoriesWithProducts = await Promise.all(
    englishCategoriesList.map(async (cat: any) => {
      const res = await payload.find({
        collection: 'products',
        where: { 'category.slug': { equals: cat.slug } },
        limit: 20,
      })

      // Fetch distinct language string variations for the current unique slug loop iteration
      const enTitle = CATEGORY_MAP.en.find((c) => c.slug === cat.slug)?.title || ''
      const arTitle = CATEGORY_MAP.ar.find((c) => c.slug === cat.slug)?.title || ''
      const ckbTitle = CATEGORY_MAP.ckb.find((c) => c.slug === cat.slug)?.title || ''

      return {
        slug: cat.slug,
        en: enTitle,
        ar: arTitle,
        ckb: ckbTitle,
        products: res.docs,
      }
    }),
  )

  let otherProducts: any[] = []
  try {
    const otherRes = await payload.find({
      collection: 'products',
      where: {
        and: englishCategoriesList.map((cat) => ({
          'category.slug': { not_equals: cat.slug },
        })),
      },
      limit: 20,
    })
    otherProducts = otherRes.docs
  } catch (e) {
    console.error('Failed fetching other categories:', e)
  }

  const formatProductForCarousel = (p: any) => {
    const isImageObj = p.featuredImage && typeof p.featuredImage === 'object' && p.featuredImage.url
    return {
      ...p,
      id: String(p.id),
      featuredImage: isImageObj
        ? { url: p.featuredImage.url, alt: p.featuredImage.alt || '' }
        : null,
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        direction: isRtl ? 'rtl' : 'ltr',
        backgroundColor: '#fff',
      }}
    >
      <CategoryCarousel currentLocale={currentLocale} />
      <div className={styles.promoWrapper}>
        <PromoCarousel currentLocale={currentLocale} />
        <PCBuilderSection currentLocale={currentLocale} isRtl={isRtl} />
      </div>

      <main style={{ flex: '1', paddingBottom: '3rem' }}>
        {productsWithDiscount.length > 0 && (
          <section style={{ padding: '1.5rem max(1.5rem, calc((100% - 1200px)/2)) 0' }}>
            <LocalizedHeading
              currentLocale={currentLocale}
              en="Hot Discounts 🔥"
              ar="خصومات كبرى 🔥"
              ckb="داشکانە گەورەکان 🔥"
              style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}
            />
            <ProductCarousel
              isRtl={isRtl}
              currentLocale={currentLocale}
              products={productsWithDiscount.map(formatProductForCarousel)}
            />
          </section>
        )}

        {categoriesWithProducts.map((cat) => {
          if (cat.products.length === 0) return null
          return (
            <section
              key={cat.slug}
              style={{ padding: '2rem max(1.5rem, calc((100% - 1200px)/2)) 0' }}
            >
              <LocalizedHeading
                currentLocale={currentLocale}
                en={cat.en}
                ar={cat.ar}
                ckb={cat.ckb}
                style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}
              />
              <ProductCarousel
                isRtl={isRtl}
                currentLocale={currentLocale}
                products={cat.products.map(formatProductForCarousel)}
              />
            </section>
          )
        })}

        {otherProducts.length > 0 && (
          <section style={{ padding: '2rem max(1.5rem, calc((100% - 1200px)/2)) 0' }}>
            <LocalizedHeading
              currentLocale={currentLocale}
              en="Other Products"
              ar="منتجات أخرى"
              ckb="کاڵاکانی تر"
              style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}
            />
            <ProductCarousel
              isRtl={isRtl}
              currentLocale={currentLocale}
              products={otherProducts.map(formatProductForCarousel)}
            />
          </section>
        )}
      </main>
    </div>
  )
}
