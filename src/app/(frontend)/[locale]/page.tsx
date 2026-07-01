import { getPayload } from 'payload'
import config from '@/payload.config'
import { calculateProductPrice } from '@/utils/price'
import PromoCarousel from '@/components/PromoCarousel'
import ProductCarousel from '@/components/ProductCarousel'
import LocalizedHeading from '@/components/LocalizedHeading'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: any }>
}

import type { Metadata } from 'next'
import { MAIN_CATEGORIES } from '@/utils/categories'
import { getStorefrontMetadata } from '@/utils/seo'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  return getStorefrontMetadata({ locale: resolvedParams.locale })
}

export default async function StorefrontHome({ params, searchParams }: PageProps) {
  const resolvedParams = await params
  const currentLocale = resolvedParams.locale || 'en'
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  const payload = await getPayload({ config })

  // 1. Fetch Hot Discounts
  let productsWithDiscount: any[] = []
  try {
    const fetchedDiscounts = await payload.find({
      collection: 'products',
      locale: currentLocale as any,
      where: { hasDiscount: { equals: true } },
      limit: 20,
    })
    productsWithDiscount = fetchedDiscounts.docs
  } catch (err) {
    const fallbackData = await payload.find({
      collection: 'products',
      locale: currentLocale as any,
      limit: 50,
    })
    productsWithDiscount = fallbackData.docs.filter((p) => calculateProductPrice(p).isDiscounted)
  }

  // 2. Fetch Category Specific Products Parallelized
  const categoriesWithProducts = await Promise.all(
    MAIN_CATEGORIES.map(async (cat) => {
      const res = await payload.find({
        collection: 'products',
        locale: currentLocale as any,
        where: { 'category.slug': { equals: cat.slug } },
        limit: 20,
      })
      return { ...cat, products: res.docs }
    }),
  )

  // 3. Fetch "Others" Category (Products not matching listed primary categories)
  let otherProducts: any[] = []
  try {
    const otherRes = await payload.find({
      collection: 'products',
      locale: currentLocale as any,
      where: {
        and: MAIN_CATEGORIES.map((cat) => ({
          'category.slug': { not_equals: cat.slug },
        })),
      },
      limit: 20,
    })
    otherProducts = otherRes.docs
  } catch (e) {
    console.error('Failed fetching other categories:', e)
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
      {/* HERO HERO PROMOTIONS */}
      <PromoCarousel currentLocale={currentLocale} />

      {/* MAIN CAROUSEL BROWSING LAYOUT */}
      <main style={{ flex: '1', paddingBottom: '3rem' }}>
        {/* 🌟 HOT DISCOUNTS */}
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
              products={productsWithDiscount}
            />
          </section>
        )}

        {/* 📦 MAP FIXED DYNAMIC CATEGORIES (Hidden if empty) */}
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
                products={cat.products}
              />
            </section>
          )
        })}

        {/* 🔄 FALLBACK REMAINING CATEGORIES (Hidden if empty) */}
        {otherProducts.length > 0 && (
          <section style={{ padding: '2rem max(1.5rem, calc((100% - 1200px)/2)) 0' }}>
            <LocalizedHeading
              currentLocale={currentLocale}
              en="Other Products"
              ar="منتجات أخرى"
              ckb="کاڵاکانی تر"
              style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}
            />
            <ProductCarousel isRtl={isRtl} currentLocale={currentLocale} products={otherProducts} />
          </section>
        )}
      </main>
    </div>
  )
}
