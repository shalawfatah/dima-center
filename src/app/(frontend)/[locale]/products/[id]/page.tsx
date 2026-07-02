import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { calculateProductPrice } from '@/utils/price'
import ProductBuyActions from '@/components/cart/ProductBuyActions'
import Image from 'next/image'

import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'
import ProductGallery from '@/components/ProductGallery'

interface ProductPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  return getStorefrontMetadata({ locale: resolvedParams.locale })
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const currentLocale = resolvedParams.locale || 'en'
  const productId = resolvedParams.id
  const payload = await getPayload({ config })

  let product
  try {
    product = await payload.findByID({
      collection: 'products',
      id: productId,
      locale: currentLocale as 'en' | 'ar' | 'ckb',
    })
  } catch (err) {
    return notFound()
  }

  const relatedData = await payload.find({
    collection: 'products',
    locale: currentLocale as 'en' | 'ar' | 'ckb',
    where: {
      and: [
        {
          category: {
            equals:
              typeof product.category === 'object'
                ? (product.category as any).id
                : product.category,
          },
        },
        { id: { not_equals: product.id } },
      ],
    },
    limit: 4,
  })

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const featuredImageUrl =
    product.featuredImage && typeof product.featuredImage === 'object'
      ? (product.featuredImage as any).url
      : null

  const mainPriceSpecs = calculateProductPrice(product)

  const productCategoryName =
    product.category && typeof product.category === 'object'
      ? (product.category as any).title || (product.category as any).name
      : ''

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
      <style>{`
        .product-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          margin-top: 2rem;
        }
        @media (min-width: 992px) {
          .product-layout-grid {
            grid-template-columns: 1.2fr 0.8fr;
          }
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
      `}</style>

      <main style={{ flex: '1', padding: '2rem max(1.5rem, calc((100% - 1200px)/2))' }}>
        <div style={{ marginBottom: '1.5rem', fontSize: '13px', color: '#666' }}>
          <Link href={`/${currentLocale}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {currentLocale === 'ar' ? 'الرئيسية' : currentLocale === 'ckb' ? 'سەرەکی' : 'Home'}
          </Link>
          {' / '}
          <span style={{ textTransform: 'uppercase' }}>{productCategoryName || 'Hardware'}</span>
        </div>

        <div className="product-layout-grid">
          {/* === LEFT COLUMN: VISUAL MEDIA & CAROUSEL PANEL === */}
          <div style={{ position: 'relative' }}>
            {mainPriceSpecs.isDiscounted && (
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: isRtl ? 'auto' : '16px',
                  right: isRtl ? '16px' : 'auto',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  zIndex: 10,
                }}
              >
                {mainPriceSpecs.badgeText}{' '}
                {currentLocale === 'ar' ? 'خصم' : currentLocale === 'ckb' ? 'داشکانـدن' : 'OFF'}
              </span>
            )}

            <ProductGallery
              title={product.title}
              featuredImageUrl={featuredImageUrl}
              imagesGallery={product.imagesGallery}
              isRtl={isRtl}
            />

            {/* === TECHNICAL SPECIFICATIONS MATRIX === */}
            <div style={{ marginTop: '3rem' }}>
              <h3
                style={{
                  fontFamily: '"Rudaw", sans-serif',
                  color: '#1e293b',
                  borderBottom: '2px solid #f0f0f0',
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                }}
              >
                {currentLocale === 'ar'
                  ? 'المواصفات التقنية'
                  : currentLocale === 'ckb'
                    ? 'تایبەتمەندییە تەکنیكییەکان'
                    : 'Technical Specifications'}
              </h3>

              {product.technicalSpecs && product.technicalSpecs.length > 0 ? (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  <tbody>
                    {product.technicalSpecs.map((spec: any, idx: number) => (
                      <tr
                        key={spec.id || idx}
                        style={{ background: idx % 2 === 0 ? '#f9f9f9' : '#fff' }}
                      >
                        <td
                          style={{
                            padding: '0.75rem 1rem',
                            fontWeight: 'bold',
                            width: '35%',
                            borderBottom: '1px solid #eee',
                            color: '#333',
                          }}
                        >
                          {spec.key}
                        </td>
                        <td
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid #eee',
                            color: '#555',
                          }}
                        >
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#888', fontSize: '14px', padding: '1rem 0' }}>
                  {currentLocale === 'ar'
                    ? 'لا توجد مواصفات فنية متوفرة.'
                    : currentLocale === 'ckb'
                      ? 'هیچ تایبەتمەندییەکی تەکنیكی بەردەست نییە.'
                      : 'No technical specifications available.'}
                </p>
              )}
            </div>
          </div>

          {/* === RIGHT COLUMN: TRANSACTION SIDEBAR PANEL === */}
          <div>
            <div
              style={{
                border: '1px solid #eef0f2',
                padding: '2rem',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                background: '#fff',
                position: 'sticky',
                top: '20px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              >
                {product.condition?.replace('_', ' ')}
              </span>

              <h1
                style={{
                  fontFamily: '"Rudaw", sans-serif',
                  color: '#1e293b',
                  fontSize: '2rem',
                  marginTop: '1rem',
                  marginBottom: '0.5rem',
                  fontWeight: '700',
                  lineHeight: '1.2',
                }}
              >
                {product.title}
              </h1>
              <p
                style={{ color: '#555', fontSize: '15px', lineHeight: '1.6', marginBottom: '2rem' }}
              >
                {product.description}
              </p>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <span style={{ color: '#666' }}>
                    {currentLocale === 'ar'
                      ? 'حالة المخزون'
                      : currentLocale === 'ckb'
                        ? 'بڕی بەردەست'
                        : 'Stock Status'}
                  </span>
                  <span
                    style={{ fontWeight: 'bold', color: product.stock > 0 ? '#16a34a' : '#dc2626' }}
                  >
                    {product.stock > 0
                      ? currentLocale === 'ar'
                        ? `متوفر (${product.stock} قطع)`
                        : currentLocale === 'ckb'
                          ? `بەردەستە (${product.stock} دانە)`
                          : `In Stock (${product.stock} items)`
                      : currentLocale === 'ar'
                        ? 'غير متوفر'
                        : currentLocale === 'ckb'
                          ? 'بڕاوە'
                          : 'Out of Stock'}
                  </span>
                </div>

                <form
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    marginTop: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <label style={{ color: '#666' }}>
                      {currentLocale === 'ar'
                        ? 'الكمية'
                        : currentLocale === 'ckb'
                          ? 'بڕ'
                          : 'Quantity'}
                    </label>
                    <input
                      type="number"
                      id="qty-counter"
                      defaultValue="1"
                      min="1"
                      max={product.stock}
                      style={{
                        width: '70px',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        fontSize: '16px',
                        textAlign: 'center',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      borderTop: '1px solid #f0f0f0',
                      paddingTop: '1.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                        color: '#444',
                        fontWeight: 'bold',
                        fontFamily: 'Rudaw',
                      }}
                    >
                      {currentLocale === 'ar'
                        ? 'المجموع الكلي:'
                        : currentLocale === 'ckb'
                          ? 'کۆی گشتی:'
                          : 'Total Amount:'}
                    </span>

                    <div
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
                    >
                      {mainPriceSpecs.isDiscounted ? (
                        <>
                          <span
                            style={{
                              fontSize: '14px',
                              textDecoration: 'line-through',
                              color: '#94a3b8',
                              fontWeight: '500',
                            }}
                          >
                            ${mainPriceSpecs.originalPrice}
                          </span>
                          <span
                            style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ef4444' }}
                          >
                            ${mainPriceSpecs.finalPrice}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#000' }}>
                          ${mainPriceSpecs.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <ProductBuyActions
                    product={product}
                    finalPrice={Number(mainPriceSpecs.finalPrice)}
                    originalPrice={Number(mainPriceSpecs.originalPrice)}
                    isDiscounted={mainPriceSpecs.isDiscounted}
                    currentLocale={currentLocale}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED RECOMMENDATIONS FOOTER */}
        <div style={{ marginTop: '6rem', borderTop: '1px solid #eee', paddingTop: '3rem' }}>
          <h3
            style={{
              fontFamily: '"Rudaw", sans-serif',
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1e293b',
            }}
          >
            {currentLocale === 'ar'
              ? 'منتجات مشابهة قد تعجبك'
              : currentLocale === 'ckb'
                ? 'کاڵای هاوشێوە کە بەدڵت دەبێت'
                : 'More Products You Might Like'}
          </h3>
          {relatedData.docs.length === 0 ? (
            <p style={{ color: '#888', marginTop: '1rem', fontSize: '14px' }}>
              No related components inside this section yet.
            </p>
          ) : (
            <div className="related-grid">
              {relatedData.docs.map((item) => {
                const itemImgObj = item.featuredImage && typeof item.featuredImage === 'object'
                const itemImgUrl = itemImgObj ? (item.featuredImage as any).url : null
                const relatedPriceSpecs = calculateProductPrice(item)

                return (
                  <Link
                    key={item.id}
                    href={`/${currentLocale}/products/${item.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div
                      style={{
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        padding: '1rem',
                        background: '#fff',
                        position: 'relative',
                      }}
                    >
                      {relatedPriceSpecs.isDiscounted && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: isRtl ? 'auto' : '8px',
                            right: isRtl ? '8px' : 'auto',
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            zIndex: 5,
                          }}
                        >
                          {relatedPriceSpecs.badgeText} OFF
                        </span>
                      )}

                      <div
                        style={{
                          width: '100%',
                          height: '140px',
                          background: '#fcfcfc',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          marginBottom: '0.75rem',
                        }}
                      >
                        {itemImgUrl ? (
                          <Image
                            width={400}
                            height={400}
                            src={itemImgUrl}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <div
                            style={{
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ddd',
                              fontSize: '12px',
                            }}
                          >
                            📦 No Image
                          </div>
                        )}
                      </div>
                      <h4
                        style={{
                          fontFamily: '"Rudaw", sans-serif',
                          color: '#1e293b',
                          fontSize: '14px',
                          margin: '0 0 0.5rem 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </h4>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                        {relatedPriceSpecs.isDiscounted ? (
                          <>
                            <span
                              style={{ fontWeight: 'bold', fontSize: '16px', color: '#ef4444' }}
                            >
                              ${relatedPriceSpecs.finalPrice}
                            </span>
                            <span
                              style={{
                                fontSize: '12px',
                                textDecoration: 'line-through',
                                color: '#94a3b8',
                              }}
                            >
                              ${relatedPriceSpecs.originalPrice}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            ${relatedPriceSpecs.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
