import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { calculateProductPrice } from '@/utils/price'
import ProductBuyActions from '@/components/cart/ProductBuyActions'
import Image from 'next/image'

interface ProductPageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params
  const currentLocale = resolvedParams.locale || 'en'
  const productId = resolvedParams.id
  const payload = await getPayload({ config })

  // 1. Fetch primary product data bound to the active locale state
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

  // 2. Fetch related items from the same hardware category
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

  // RTL Direction tracking flag
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const featuredImageUrl =
    product.featuredImage && typeof product.featuredImage === 'object'
      ? (product.featuredImage as any).url
      : null

  // 🏷️ CALCULATE ACTIVE PRODUCT DISCOUNT METRICS
  const mainPriceSpecs = calculateProductPrice(product)

  // 👑 SAFE RELATION CATEGORY RESOLVER
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
        .gallery-strip {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          overflow-x: auto;
        }
        .gallery-thumb {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #ddd;
          background: #f4f4f4;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
      `}</style>

      <main style={{ flex: '1', padding: '2rem max(1.5rem, calc((100% - 1200px)/2))' }}>
        {/* Localization Link Breadcrumb Bar */}
        <div style={{ marginBottom: '1.5rem', fontSize: '13px', color: '#666' }}>
          <Link href={`/${currentLocale}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {currentLocale === 'ar' ? 'الرئيسية' : currentLocale === 'ckb' ? 'سەرەکی' : 'Home'}
          </Link>
          {' / '}
          <span style={{ textTransform: 'uppercase' }}>{productCategoryName || 'Hardware'}</span>
        </div>

        <div className="product-layout-grid">
          {/* === LEFT COLUMN: VISUAL MEDIA & MATRIX PANEL === */}
          <div>
            <div
              style={{
                width: '100%',
                maxHeight: '450px',
                background: '#fafafa',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #eee',
                position: 'relative',
              }}
            >
              {/* 🏷️ SALE CORNER BADGE OVERLAY */}
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

              {featuredImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <Image
                  height={400}
                  width={400}
                  src={featuredImageUrl}
                  alt={product.title}
                  style={{
                    width: '100%',
                    maxHeight: '450px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              ) : (
                <div
                  style={{
                    height: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#aaa',
                  }}
                >
                  📦 No Image Provided
                </div>
              )}
            </div>

            {/* Images Carousel Gallery strip */}
            {product.imagesGallery && product.imagesGallery.length > 0 && (
              <div className="gallery-strip">
                {featuredImageUrl && (
                  <Image
                    height={400}
                    width={400}
                    src={featuredImageUrl}
                    className="gallery-thumb"
                    style={{ borderColor: '#0070f3' }}
                    alt="Thumb master"
                  />
                )}
                {product.imagesGallery.map((item: any) => {
                  const url = item.image && typeof item.image === 'object' ? item.image.url : null
                  if (!url) return null
                  return (
                    <Image
                      height={400}
                      width={400}
                      key={item.id}
                      src={url}
                      className="gallery-thumb"
                      alt="Gallery strip segment"
                    />
                  )
                })}
              </div>
            )}

            {/* === TECHNICAL SPECIFICATIONS MATRIX === */}
            <div style={{ marginTop: '3rem' }}>
              <h3
                style={{
                  fontFamily: '"Rudaw", sans-serif' /* 🌟 FIX: Applied Rudaw & Darker Text */,
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
                  fontFamily: '"Rudaw", sans-serif' /* 🌟 FIX: Added Font Family */,
                  color: '#1e293b' /* 🌟 FIX: Forced to slate-charcoal instead of white */,
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

                  {/* 🏷️ DYNAMICALLY BALANCED TOTAL VALUE AND PRICE DISPLAY */}
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
            {' '}
            {/* 🌟 FIX: Added Font & Color */}
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

                // 🏷️ CALCULATE RELATED ITEMS PRICING DYNAMICS INDEPENDENTLY
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
                          fontFamily: '"Rudaw", sans-serif' /* 🌟 FIX: Added Font */,
                          color: '#1e293b' /* 🌟 FIX: Added explicit color */,
                          fontSize: '14px',
                          margin: '0 0 0.5rem 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </h4>

                      {/* RELATED ITEM DYNAMIC PRICING INLINE */}
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
