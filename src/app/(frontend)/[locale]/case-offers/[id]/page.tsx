import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'

import ProductBreadcrumb from '@/components/product/ProductBreadcrumb'
import ProductMediaColumn from '@/components/product/ProductMediaColumn'
import ProductInfoSidebar from '@/components/product/ProductInfoSidebar'
import RelatedProducts from '@/components/product/RelatedProducts'
import styles from '@/styles/product-detail.module.css'

interface OfferPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

// 🎯 DYNAMIC CASE OFFERS METADATA
export async function generateMetadata({ params }: OfferPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const currentLocale = resolvedParams.locale || 'en'
  const offerId = resolvedParams.id

  const baseMeta = await getStorefrontMetadata({ locale: currentLocale })

  try {
    const payload = await getPayload({ config })

    const offer = await payload.findByID({
      collection: 'case-offers',
      id: offerId,
      locale: currentLocale as 'en' | 'ar' | 'ckb',
    })

    if (!offer) return baseMeta

    const title = offer.title || ''
    const description = typeof offer.description === 'string' ? offer.description : ''
    const imageUrl =
      offer.featured_image && typeof offer.featured_image === 'object'
        ? (offer.featured_image as any).url
        : undefined

    const titleValue = baseMeta?.title as any
    const baseSiteTitle =
      titleValue && typeof titleValue === 'object'
        ? titleValue.absolute || titleValue.default
        : typeof titleValue === 'string'
          ? titleValue
          : 'Storefront'

    return {
      ...baseMeta,
      title: `${title} | ${baseSiteTitle}`,
      description: description || baseMeta.description,
      openGraph: {
        ...baseMeta?.openGraph,
        title,
        description,
        type: 'video.other',
        ...(imageUrl && {
          images: [
            {
              url: imageUrl,
              width: 800,
              height: 800,
              alt: title,
            },
          ],
        }),
      },
    }
  } catch (error) {
    return baseMeta
  }
}

export default async function CaseOfferDetailPage({ params }: OfferPageProps) {
  const resolvedParams = await params
  const currentLocale = resolvedParams.locale || 'en'
  const offerId = resolvedParams.id
  const payload = await getPayload({ config })

  // 1. Fetch Global Settings for Currency Conversions
  let settings
  try {
    settings = await payload.findGlobal({
      slug: 'general-settings',
    })
  } catch (err) {
    console.error('Failed fetching general settings config', err)
  }
  const exchangeRate = settings?.exchangeRate || 1500

  // 2. Fetch the Specific Case Offer Document
  let offer: any
  try {
    offer = await payload.findByID({
      collection: 'case-offers',
      id: offerId,
      locale: currentLocale as 'en' | 'ar' | 'ckb',
    })
  } catch (err) {
    return notFound()
  }

  // 3. Fetch alternate setup offers to present as recommendations
  let otherOffers: any[] = []
  try {
    const relatedData = await payload.find({
      collection: 'case-offers',
      locale: currentLocale as 'en' | 'ar' | 'ckb',
      where: {
        id: { not_equals: offer.id },
      },
      limit: 4,
    })
    otherOffers = relatedData.docs
  } catch (err) {
    console.error('Failed fetching other offers:', err)
  }

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  // URL encoding spaces in image URLs to prevent Supabase 400 errors
  let featuredImageUrl =
    offer.featured_image && typeof offer.featured_image === 'object'
      ? (offer.featured_image as any).url
      : null

  if (featuredImageUrl && featuredImageUrl.includes(' ')) {
    featuredImageUrl = featuredImageUrl.replace(/ /g, '%20')
  }

  // 4. Compute pricing logic cleanly to map to the layout props
  const originalPrice = Number(offer.price)
  const finalPrice = offer.discountedPrice ? Number(offer.discountedPrice) : originalPrice
  const isDiscounted = !!offer.discountedPrice && finalPrice < originalPrice

  const discountAmount = isDiscounted ? originalPrice - finalPrice : 0
  const badgeText = isDiscounted
    ? currentLocale === 'ar'
      ? `وفر $${discountAmount}`
      : currentLocale === 'ckb'
        ? `$${discountAmount} داشکان`
        : `Save $${discountAmount}`
    : ''

  // Derived IQD Pricing matching your core currency configurations
  const iqdPriceNum = finalPrice * exchangeRate

  // Translate basic hierarchy properties
  const breadcrumbCategoryName =
    currentLocale === 'ar'
      ? 'عروض الكيسات الكاملة'
      : currentLocale === 'ckb'
        ? 'ئۆفەری کەیس'
        : 'Full Build Offers'

  // Standardize other offers schema structures to look like products in RelatedProducts
  const formattedRelatedOffers = otherOffers.map((o: any) => {
    let rawUrl =
      o.featured_image && typeof o.featured_image === 'object' ? o.featured_image.url : null
    if (rawUrl && rawUrl.includes(' ')) {
      rawUrl = rawUrl.replace(/ /g, '%20')
    }
    return {
      id: String(o.id),
      title: o.title,
      price: Number(o.price),
      discountedPrice: o.discountedPrice ? Number(o.discountedPrice) : null,
      hasDiscount: !!o.discountedPrice,
      discountType: 'fixed' as const,
      discountValue: o.discountedPrice ? Number(o.price) - Number(o.discountedPrice) : 0,
      featuredImage: rawUrl ? { url: rawUrl, alt: o.featured_image.alt || o.title } : null,
    }
  })

  // Mock standard product fields for ProductInfoSidebar & Cart logic compatibility
  const mockProductForCart = {
    ...offer,
    title: offer.title,
    price: originalPrice,
    hasDiscount: isDiscounted,
    discountType: 'fixed' as const,
    discountValue: discountAmount,
    discountedPrice: offer.discountedPrice ? finalPrice : null,
    featuredImage: featuredImageUrl ? { url: featuredImageUrl } : null,
    stock: offer.stock !== undefined ? Number(offer.stock) : 99, // Fallback to 99 if schema doesn't have stock
    status: 'published', // Simulates active catalog status
    _status: 'published', // Payload fallback status key
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        direction: isRtl ? 'rtl' : 'ltr',
        backgroundColor: '#f3f3f3', // 🟢 Changed page background to light gray
      }}
    >
      <main style={{ flex: '1', padding: '2rem max(1.5rem, calc((100% - 1800px)/2))' }}>
        <ProductBreadcrumb currentLocale={currentLocale} categoryName={breadcrumbCategoryName} />

        <div className={styles['product-layout-grid']}>
          {/* Media Column rendering the case image */}
          <ProductMediaColumn
            title={offer.title}
            featuredImageUrl={featuredImageUrl}
            imagesGallery={[]} // Empty array since offers usually only have one featured media asset
            isRtl={isRtl}
            currentLocale={currentLocale}
            isDiscounted={isDiscounted}
            badgeText={badgeText}
            technicalSpecs={undefined}
          />

          {/* Interactive Sidebar Wrapper to force White BG on info card */}
          <div
            style={{
              backgroundColor: '#ffffff', // 🟢 Forces only the sidebar to have a clean white background
              borderRadius: '12px', // Matching standard modern UI design
              padding: '1.5rem',
              height: 'fit-content',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <ProductInfoSidebar
              product={mockProductForCart}
              currentLocale={currentLocale}
              isRtl={isRtl}
              finalPrice={finalPrice}
              originalPrice={originalPrice}
              isDiscounted={isDiscounted}
              iqdPrice={iqdPriceNum}
            />
          </div>
        </div>

        {/* Alternate build recommendations carousels */}
        {formattedRelatedOffers.length > 0 && (
          <RelatedProducts
            items={formattedRelatedOffers as any}
            currentLocale={currentLocale}
            isRtl={isRtl}
            exchangeRate={exchangeRate}
          />
        )}
      </main>
    </div>
  )
}
