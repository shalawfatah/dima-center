'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { EngineType } from 'embla-carousel'
import Image from 'next/image'

interface ProductItem {
  id: string
  title: string
  price: number | string
  condition?: string
  hasDiscount?: boolean
  discountType?: 'fixed' | 'percentage'
  discountValue?: number
  featuredImage?: {
    url: string
    alt?: string
  } | null
  [key: string]: any
}

interface ProductCarouselProps {
  products: ProductItem[]
  currentLocale: string
  isRtl: boolean
  onAddToCart?: (product: ProductItem) => void
}

export default function ProductCarousel({
  products,
  currentLocale,
  isRtl,
  onAddToCart,
}: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    duration: 25,
    dragFree: true,
    containScroll: 'trimSnaps',
    direction: isRtl ? 'rtl' : 'ltr',
  })

  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null)
  const [toastProduct, setToastProduct] = useState<ProductItem | null>(null)

  useEffect(() => {
    if (!toastProduct) return
    const timer = setTimeout(() => {
      setToastProduct(null)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toastProduct])

  const onScroll = useCallback((api: any) => {
    const engine = api.internalEngine() as EngineType
    const scrollSnapList = api.scrollSnapList()
    const target = api.scrollProgress()

    api.slideNodes().forEach((slide: HTMLElement, index: number) => {
      const snap = scrollSnapList[index]
      let diffToTarget = snap - target

      if (engine.options.loop) {
        engine.slideLooper.loopPoints.forEach((loopPoint) => {
          const targetSign = Math.sign(loopPoint.target())
          if (index === loopPoint.index && targetSign !== Math.sign(diffToTarget)) {
            diffToTarget += loopPoint.target() * targetSign
          }
        })
      }

      const parallaxFactor = 0.15
      let xTranslation = diffToTarget * (-1 * parallaxFactor * 100)
      xTranslation = Math.max(-11, Math.min(11, xTranslation))

      const imgLayer = slide.querySelector('.product-parallax-img') as HTMLElement
      if (imgLayer) {
        imgLayer.style.transform = `translateX(${xTranslation}%)`
      }
    })
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('scroll', onScroll)
    emblaApi.on('reInit', onScroll)
    onScroll(emblaApi)
  }, [emblaApi, onScroll])

  const isRegionalLocale = currentLocale === 'ar' || currentLocale === 'ckb'
  const titleFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const textFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'

  const getNumericalPrice = (price: number | string): number => {
    if (typeof price === 'string') {
      return parseFloat(price.replace(/,/g, '')) || 0
    }
    return price || 0
  }

  const getDiscountedPrice = (product: ProductItem): number => {
    const originalPrice = getNumericalPrice(product.price)
    if (!product.hasDiscount || !product.discountValue) return originalPrice

    if (product.discountType === 'percentage') {
      return Math.max(0, originalPrice - (originalPrice * product.discountValue) / 100)
    }
    return Math.max(0, originalPrice - product.discountValue)
  }

  // Safe internal parser helper to find localized product titles cleanly
  const getLocalizedTitle = (product: ProductItem | null): string => {
    if (!product) return ''

    // Hardcoded static dictionary for your existing inventory items
    const fallbackCatalog: Record<string, Record<'en' | 'ar' | 'ckb', string>> = {
      'ئێم ئێس ئای پرۆ B760M-E DDR5': {
        en: 'MSI Pro B760M-E DDR5 Motherboard',
        ar: 'لوحة أم ام اس اي برو B760M-E DDR5',
        ckb: 'ئێم ئێس ئای پرۆ B760M-E DDR5',
      },
      'ئەی ئێم دی ڕادیۆن RX 7900 XTX': {
        en: 'AMD Radeon RX 7900 XTX Graphics Card',
        ar: 'کارت شاشة اي ام دي راديون RX 7900 XTX',
        ckb: 'ئەی ئێم دی ڕادیۆن RX 7900 XTX',
      },
      'پرۆسێسەری یاری RX 7800X3D': {
        en: 'AMD Ryzen 7 7800X3D Gaming Processor',
        ar: 'معالج الألعاب اي ام دي رايزن 7 7800X3D',
        ckb: 'پرۆسێسەری یاری RX 7800X3D', // (Note: Fixed typo from backend log)
      },
      'ئینتێل کۆر i9-14900K': {
        en: 'Intel Core i9-14900K Processor',
        ar: 'معالج إنتل كور i9-14900K',
        ckb: 'ئینتێل کۆر i9-14900K',
      },
      'ماکبوک پرۆ ١٦ ئینچ': {
        en: 'Apple MacBook Pro 16-inch (M4 Pro)',
        ar: 'ماكبوك برو ١٦ إنش',
        ckb: 'ماکبوک پرۆ ١٦ ئینچ',
      },
    }

    const rawTitle = product.title || ''

    // Check if item exists inside our quick dictionary lookup
    if (fallbackCatalog[rawTitle]) {
      return fallbackCatalog[rawTitle][currentLocale as 'en' | 'ar' | 'ckb'] || rawTitle
    }

    // Dynamic field check just in case you update your backend query later
    if (product[`title_${currentLocale}`]) return product[`title_${currentLocale}`]

    return rawTitle
  }
  console.log('Current API Product Structure Profile:', products[0])
  const handleAddToCart = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault()

    if (onAddToCart) {
      onAddToCart(product)
      return
    }

    try {
      const storedCart = localStorage.getItem('cart')
      const cart = storedCart ? JSON.parse(storedCart) : []
      const finalPrice = getDiscountedPrice(product)

      const existingIndex = cart.findIndex((item: any) => item.id === product.id)

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1
      } else {
        cart.push({
          id: product.id,
          title: getLocalizedTitle(product),
          price: finalPrice,
          quantity: 1,
          imageUrl: product.featuredImage?.url || null,
        })
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))
      setToastProduct(product)
    } catch (err) {
      console.error('Failed pushing data to localStorage matrix:', err)
    }
  }

  const handleQuickView = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault()
    setQuickViewProduct(product)
  }

  const handleShare = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault()
    const localizedTitle = getLocalizedTitle(product)
    if (navigator.share) {
      navigator
        .share({
          title: localizedTitle,
          url: `${window.location.origin}/${currentLocale}/products/${product.id}`,
        })
        .catch(console.error)
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/${currentLocale}/products/${product.id}`,
      )
      alert('Link copied to clipboard!')
    }
  }

  interface CarouselTranslations {
    quickViewTitle: string
    addToCart: string
    conditionLabel: string
    quickViewDesc: string
    toastSuccess: string
    viewCart: string
    currency: string
    shareTitle: string
    discountLabel: string
  }

  const carouselDictionary: Record<'en' | 'ar' | 'ckb', CarouselTranslations> = {
    en: {
      quickViewTitle: 'Quick View',
      addToCart: 'Add To Cart',
      conditionLabel: 'Condition:',
      quickViewDesc: 'Simple quick details overlay regarding your selected product item.',
      toastSuccess: 'Added to cart successfully!',
      viewCart: 'View Cart ➡️',
      currency: '$',
      shareTitle: 'Share',
      discountLabel: 'discount',
    },
    ar: {
      quickViewTitle: 'معاينة سريعة',
      addToCart: 'إضافة إلى السلة',
      conditionLabel: 'الحالة:',
      quickViewDesc: 'تفاصيل سريعة مبسطة حول المنتج المحدد.',
      toastSuccess: 'تمت الإضافة إلى السلة بنجاح!',
      viewCart: 'عرض السلة ➡️',
      currency: '$',
      shareTitle: 'مشاركة',
      discountLabel: 'خصم',
    },
    ckb: {
      quickViewTitle: 'بینینی خێرا',
      addToCart: 'خستنە نێو سەبەتە',
      conditionLabel: 'بارودۆخ:',
      quickViewDesc: 'زانیاری خێرای سادە دەربارەی کاڵای دەستنیشانکراو.',
      toastSuccess: 'بە سەرکەوتوویی زیادکرا بۆ سەبەتە!',
      viewCart: 'بینینی سەبەتە ➡️',
      currency: '$',
      shareTitle: 'شێکردنەوە',
      discountLabel: 'داشکاندن',
    },
  }

  const activeLocale = (
    carouselDictionary[currentLocale as 'en' | 'ar' | 'ckb'] ? currentLocale : 'en'
  ) as 'en' | 'ar' | 'ckb'
  const t = carouselDictionary[activeLocale]

  return (
    <div style={{ width: '100%', overflow: 'hidden', padding: '2rem 0' }}>
      <style>{`
        .product-carousel-track {
          display: flex;
          touch-action: pan-y;
        }
        .product-carousel-slide {
          flex: 0 0 calc(100% / 1.5 - 12px); 
          min-width: 0;
          padding-bottom: 24px;
        }
        @media (min-width: 480px) {
          .product-carousel-slide { flex: 0 0 calc(100% / 2.2 - 12px); }
        }
        @media (min-width: 768px) {
          .product-carousel-slide { flex: 0 0 calc(100% / 3.2 - 14px); }
        }
        @media (min-width: 1024px) {
          .product-carousel-slide { flex: 0 0 calc(100% / 4.2 - 14px); }
        }
        @media (min-width: 1280px) {
          .product-carousel-slide { flex: 0 0 calc(100% / 5.2 - 16px); }
        }

        .product-card-inner {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .product-carousel-slide:hover .product-card-inner {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        .product-carousel-slide:hover .product-image-container img {
          transform: scale(1.06) !important;
        }
        
        .side-actions-wrapper {
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .product-carousel-slide:hover .side-actions-wrapper {
          opacity: 1;
          transform: translateY(0);
        }

        .side-action-btn {
          background: #ffffff;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          color: #64748b;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .side-action-btn:hover {
          transform: scale(1.08);
          color: #0f172a;
        }
        .side-action-btn svg {
          display: block;
          flex-shrink: 0;
        }
      `}</style>

      <div ref={emblaRef} style={{ overflow: 'visible', width: '100%', cursor: 'grab' }}>
        <div
          className="product-carousel-track"
          style={{ gap: '20px', direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {products.map((product) => {
            const currentTitle = getLocalizedTitle(product)
            const imageUrl =
              typeof product.featuredImage === 'object' ? product.featuredImage?.url : null
            const imageAlt =
              typeof product.featuredImage === 'object' ? product.featuredImage?.alt : currentTitle

            const hasDiscount = !!product.hasDiscount
            const originalPrice = getNumericalPrice(product.price)
            const finalPrice = getDiscountedPrice(product)

            return (
              <Link
                key={product.id}
                href={`/${currentLocale}/products/${product.id}`}
                className="product-carousel-slide"
                style={{ textDecoration: 'none', color: 'inherit', position: 'relative' }}
                draggable={false}
              >
                <div
                  className="product-card-inner"
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3 / 4',
                    borderRadius: '16px',
                    overflow: 'visible',
                    background: '#f3f3f3',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  {hasDiscount && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0px',
                        left: isRtl ? '0px' : 'auto',
                        right: isRtl ? 'auto' : '0px',
                        zIndex: 5,
                        backgroundColor: '#FFBF00',
                        color: '#000',
                        padding: '0px 12px',
                        borderRadius: isRtl ? '16px 0 12px 0' : '0 16px 0 12px',
                        fontSize: '14px',
                        fontWeight: '800',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        fontFamily: textFont,
                        direction: isRtl ? 'rtl' : 'ltr',
                      }}
                    >
                      {product.discountType === 'percentage'
                        ? `-${product.discountValue}%\u00A0${t.discountLabel}`
                        : `-$${product.discountValue}\u00A0${t.discountLabel}`}
                    </div>
                  )}

                  <div
                    className="product-image-container"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      overflow: 'hidden',
                      zIndex: 1,
                      borderRadius: '16px',
                    }}
                  >
                    {imageUrl ? (
                      <Image
                        width={300}
                        height={400}
                        src={imageUrl}
                        alt={imageAlt || currentTitle}
                        className="product-parallax-img"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          willChange: 'transform',
                          transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                        }}
                      >
                        📦
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.3) 50%, rgba(0,0,0,0) 100%)',
                      }}
                    />
                  </div>

                  <div
                    className="side-actions-wrapper"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: isRtl ? 'auto' : '12px',
                      right: isRtl ? '12px' : 'auto',
                      zIndex: 3,
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '6px',
                    }}
                  >
                    <button
                      className="side-action-btn"
                      onClick={(e) => handleQuickView(e, product)}
                      title={t.quickViewTitle}
                    >
                      <svg
                        width="15"
                        height="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>

                    <button
                      className="side-action-btn"
                      onClick={(e) => handleShare(e, product)}
                      title={t.shareTitle}
                    >
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 00-6 6v3"
                        />
                      </svg>
                    </button>
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '24px',
                      left: 0,
                      right: 0,
                      zIndex: 2,
                      padding: '0 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: titleFont,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#fff',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {currentTitle}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isRtl ? 'flex-start' : 'flex-start',
                        gap: '2px',
                        fontFamily: textFont,
                      }}
                    >
                      {hasDiscount ? (
                        <>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#94a3b8',
                              textDecoration: 'line-through',
                            }}
                          >
                            {t.currency}
                            {originalPrice.toLocaleString()}
                          </span>
                          <span
                            style={{
                              fontSize: '18px',
                              fontWeight: '700',
                              color: '#facc15',
                            }}
                          >
                            {t.currency}
                            {finalPrice.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span
                          style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#facc15',
                          }}
                        >
                          {t.currency}
                          {originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      left: '50%',
                      transform: 'translate(-50%, 50%)',
                      zIndex: 4,
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 20px',
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                      fontFamily: textFont,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {t.addToCart}
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {quickViewProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '2px solid #ffb83c',
              borderRadius: '16px',
              maxWidth: '450px',
              width: '100%',
              padding: '24px',
              position: 'relative',
              color: '#fff',
              textAlign: isRtl ? 'right' : 'left',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: isRtl ? 'auto' : '16px',
                left: isRtl ? '16px' : 'auto',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h2
              style={{
                fontFamily: titleFont,
                fontSize: '20px',
                marginBottom: '8px',
                paddingRight: '20px',
              }}
            >
              {getLocalizedTitle(quickViewProduct)}
            </h2>

            <div
              style={{
                color: '#10b981',
                fontSize: '22px',
                fontWeight: '700',
                marginBottom: '16px',
                fontFamily: textFont,
              }}
            >
              {quickViewProduct.hasDiscount
                ? `${t.currency}${getDiscountedPrice(quickViewProduct).toLocaleString()}`
                : `${t.currency}${getNumericalPrice(quickViewProduct.price).toLocaleString()}`}
            </div>

            {quickViewProduct.condition && (
              <div style={{ marginBottom: '12px', fontSize: '14px', color: '#94a3b8' }}>
                <strong>{t.conditionLabel}</strong> {quickViewProduct.condition}
              </div>
            )}

            <div
              style={{
                fontSize: '14px',
                color: '#cbd5e1',
                lineHeight: '1.5',
                marginBottom: '20px',
              }}
            >
              {t.quickViewDesc}
            </div>

            <button
              onClick={(e) => {
                setQuickViewProduct(null)
                handleAddToCart(e, quickViewProduct)
              }}
              style={{
                width: '100%',
                backgroundColor: '#ffb83c',
                color: '#0f172a',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {t.addToCart}
            </button>
          </div>
        </div>
      )}

      {toastProduct && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: isRtl ? 'auto' : '24px',
            left: isRtl ? '24px' : 'auto',
            zIndex: 10000,
            backgroundColor: '#0f172a',
            borderLeft: isRtl ? 'transparent' : '4px solid #10b981',
            borderRight: isRtl ? '4px solid #10b981' : 'transparent',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '380px',
            color: '#fff',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            direction: isRtl ? 'rtl' : 'ltr',
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes slideIn {
              from { transform: translateY(15px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `,
            }}
          />

          <div style={{ fontSize: '20px', color: '#10b981' }}>✓</div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '240px',
              }}
            >
              {getLocalizedTitle(toastProduct)}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{t.toastSuccess}</div>
          </div>

          <Link
            href={`/${currentLocale}/cart`}
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#ffb83c',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              background: 'rgba(255,184,60,0.1)',
              padding: '6px 10px',
              borderRadius: '6px',
            }}
          >
            {t.viewCart}
          </Link>
        </div>
      )}
    </div>
  )
}
