import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { calculateProductPrice } from '@/utils/price'
import PromoCarousel from '@/components/PromoCarousel'
import NavUserMenu from '@/components/NavUserMenu'
import Image from 'next/image'

import logoImg from '../../../../public/media/logo.png'
import { search_styles } from '@/styles/search_styles'
import Languages from '@/components/Languages'
import ProductCarousel from '@/components/ProductCarousel'
import LocalizedHeading from '@/components/LocalizedHeading'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: any }>
}

// Map configuration for targeted storefront categories
const MAIN_CATEGORIES = [
  { slug: 'cpu', en: 'CPUs', ar: 'المعالجات (CPU)', ckb: 'پڕۆسێسەر (CPU)' },
  { slug: 'gpu', en: 'Graphics Cards', ar: 'كروت الشاشة (GPU)', ckb: 'کارتی شاشە (GPU)' },
  { slug: 'storage', en: 'Storage', ar: 'وحدات التخزين', ckb: 'بیرگە و خەزن' },
  { slug: 'ram', en: 'Memory (RAM)', ar: 'الذاكرة العشوائية (RAM)', ckb: 'ڕام (RAM)' },
  { slug: 'motherboard', en: 'Motherboards', ar: 'اللوحات الأم', ckb: 'مازەربۆرد' },
  { slug: 'case', en: 'PC Cases', ar: 'كيسات الكمبيوتر', ckb: 'کەیس' },
  { slug: 'laptop', en: 'Laptops', ar: 'الأجهزة المحمولة', ckb: 'لاپتۆپ' },
  { slug: 'desktop', en: 'Desktop Systems', ar: 'أنظمة الديسكتوب', ckb: 'کۆمپیوتەری دیسکتۆپ' },
  { slug: 'accessories', en: 'Accessories', ar: 'الإكسسوارات', ckb: 'بێورکاری و ئێکسسوارات' },
]

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
      <style>{search_styles()}</style>

      {/* HEADER SECTION */}
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

          <div className="actions-cluster">
            <NavUserMenu currentLocale={currentLocale} />
            <Languages currentLocale={currentLocale} />
          </div>
        </div>

        <div className="independent-nav-row">
          <Navbar currentLocale={currentLocale} />
        </div>
      </header>

      {/* HERO HERO PROMOTIONS */}
      <PromoCarousel currentLocale={currentLocale} />

      {/* MAIN CAROUSEL BROWSING LAYOUT */}
      <main style={{ flex: '1', paddingBottom: '3rem' }}>
        {/* 🌟 HOT DISCOUNTS */}
        {productsWithDiscount.length > 0 && (
          <section style={{ padding: '1.5rem max(1.5rem, calc((100% - 1200px)/2)) 0' }}>
            <LocalizedHeading
              currentLocale={currentLocale}
              en="Hot Discounts"
              ar="خصومات كبرى"
              ckb="داشکانە گەرمەکان"
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

      {/* FOOTER */}
      <Footer currentLocale={currentLocale} />
    </div>
  )
}
