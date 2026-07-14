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
import { CATEGORY_MAP } from '@/utils/categories'
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
  const currentLocale =
    rawLocale === 'en' || rawLocale === 'ar' || rawLocale === 'ckb' ? rawLocale : 'en'

  const activeCategory = resolvedSearchParams.category || ''
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const dirClass = isRtl ? styles.rtl : styles.ltr

  const payload = await getPayload({ config })

  const englishCategoriesList = CATEGORY_MAP['en']

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
      <div className={`${styles.pageWrapper} ${styles.pageWrapperFiltered} ${dirClass}`}>
        <main className={styles.filteredMain}>
          <div className={styles.filteredHeader}>
            <LocalizedHeading
              currentLocale={currentLocale}
              en={matchedCatEn?.title || 'Products'}
              ar={matchedCatAr?.title || 'المنتجات'}
              ckb={matchedCatCkb?.title || 'کاڵاکان'}
              style={{ fontSize: '1.75rem', fontWeight: '700' }}
            />
            <Link href={`/${currentLocale}`} className={styles.showAllLink}>
              {currentLocale === 'ar'
                ? '← عرض الكل'
                : currentLocale === 'ckb'
                  ? '← پیشاندانی هەموو'
                  : '← Show All'}
            </Link>
          </div>

          {res.docs.length === 0 ? (
            <div className={styles.emptyState}>
              📦{' '}
              {currentLocale === 'ar'
                ? 'لا توجد منتجات في هذه الفئة حالياً.'
                : currentLocale === 'ckb'
                  ? 'هیچ کاڵایەک لەم بەشەدا نییە.'
                  : 'No products found in this category.'}
            </div>
          ) : (
            <div className={styles.productGrid}>
              {res.docs.map((product: any) => {
                const hasImage = product.featuredImage && typeof product.featuredImage === 'object'
                const imageUrl = hasImage ? (product.featuredImage as any).url : null
                return (
                  <Link
                    key={product.id}
                    href={`/${currentLocale}/products/${product.id}`}
                    className={styles.productCardLink}
                  >
                    <div className={styles.productCard}>
                      <div className={styles.productImageWrapper}>
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            width={200}
                            height={200}
                            alt={product.title}
                            className={styles.productImage}
                          />
                        ) : (
                          <span className={styles.productImagePlaceholder}>📦</span>
                        )}
                      </div>
                      <h3 className={styles.productTitle}>{product.title}</h3>
                      <div className={styles.productPrice}>${product.price}</div>
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
    <div className={`${styles.pageWrapper} ${styles.pageWrapperDefault} ${dirClass}`}>
      <CategoryCarousel currentLocale={currentLocale} />

      {/* 2/3 and 1/3 split layout container */}
      <div className={styles.promoWrapper}>
        <div className={styles.promoLeft}>
          <PCBuilderSection currentLocale={currentLocale} isRtl={isRtl} />
        </div>
      </div>

      <div className={styles.promoWrapper}>
        <PromoCarousel currentLocale={currentLocale} />
      </div>

      <main className={styles.defaultMain}>
        {productsWithDiscount.length > 0 && (
          <section className={styles.sectionFirst}>
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
            <section key={cat.slug} className={styles.section}>
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
          <section className={styles.section}>
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
