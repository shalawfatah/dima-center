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

  const getFallbackText = (
    product: ProductItem | null,
    fieldType: 'title' | 'description',
  ): string => {
    if (!product) return ''

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
        ckb: 'پرۆسێسەری یاری RX 7800X3D',
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

    const rawFieldVal = product[fieldType] || ''

    const getValueForLang = (lang: 'en' | 'ar' | 'ckb'): string | undefined => {
      if (product[`${fieldType}_${lang}`]) return product[`${fieldType}_${lang}`]
      if (fieldType === 'title' && fallbackCatalog[product.title]) {
        return fallbackCatalog[product.title][lang]
      }
      return undefined
    }

    const ckbVal = getValueForLang('ckb')
    const arVal = getValueForLang('ar')
    const enVal = getValueForLang('en')

    if (currentLocale === 'ckb') {
      return ckbVal || enVal || arVal || rawFieldVal
    } else if (currentLocale === 'ar') {
      return arVal || enVal || ckbVal || rawFieldVal
    } else {
      return enVal || ckbVal || arVal || rawFieldVal
    }
  }

  const getLocalizedTitle = (product: ProductItem | null): string =>
    getFallbackText(product, 'title')
  const getLocalizedDesc = (product: ProductItem | null): string =>
    getFallbackText(product, 'description')

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
    <div style={{ width: '100%', overflow: 'hidden', padding: '1rem 0' }}>
      <style>{`
        .product-carousel-track {
          display: flex;
          touch-action: pan-y;
        }
        .product-carousel-slide {
          flex: 0 0 calc(100% / 1.5 - 12px); 
          min-width: 0;
          padding-bottom: 0px;
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
          background: #ffb83c;
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
        
        /* Full-Width Hover Slide-In Overlay Configuration */
        .hover-cart-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 0;
          background-color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 10;
          transition: height 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .product-carousel-slide:hover .hover-cart-overlay {
          height: 54px;
        }
        .hover-cart-btn {
          width: 100%;
          height: 100%;
          background: #ffb83c;
          color: #000;
          border: none;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .hover-cart-btn:hover {
          background-color: #ff8c00;
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
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
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
                        backgroundColor: '#ffcb6b',
                        color: '#000',
                        padding: '2px 12px',
                        borderRadius: isRtl ? '0 0 12px 0' : '0 0 0 12px',
                        fontSize: '13px',
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
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: '90px',
                      overflow: 'hidden',
                      zIndex: 1,
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
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                        }}
                      >
                        📦
                      </div>
                    )}
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

                  {/* Absolute Base Panel Content Block (Forced White Background / Black Typography) */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '90px',
                      zIndex: 2,
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      backgroundColor: '#ffffff',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: titleFont,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#000000',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.25',
                      }}
                    >
                      {currentTitle}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        fontFamily: textFont,
                        width: '100%',
                      }}
                    >
                      {hasDiscount ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '19px',
                              fontWeight: '800',
                              color: '#000000',
                            }}
                          >
                            {t.currency}
                            {finalPrice.toLocaleString()}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#64748b',
                              textDecoration: 'line-through',
                            }}
                          >
                            {t.currency}
                            {originalPrice.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span
                          style={{
                            fontSize: '19px',
                            fontWeight: '800',
                            color: '#000000',
                          }}
                        >
                          {t.currency}
                          {originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Full-width Hover Shell Target Component Container */}
                  <div className="hover-cart-overlay">
                    <button
                      className="hover-cart-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                      style={{ fontFamily: textFont }}
                    >
                      {t.addToCart}
                    </button>
                  </div>
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
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              maxWidth: '450px',
              width: '100%',
              padding: '24px',
              position: 'relative',
              color: '#000000',
              textAlign: isRtl ? 'right' : 'left',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
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
                color: '#000000',
                fontSize: '24px',
                fontWeight: '800',
                marginBottom: '16px',
                fontFamily: textFont,
              }}
            >
              {quickViewProduct.hasDiscount
                ? `${t.currency}${getDiscountedPrice(quickViewProduct).toLocaleString()}`
                : `${t.currency}${getNumericalPrice(quickViewProduct.price).toLocaleString()}`}
            </div>

            {quickViewProduct.condition && (
              <div style={{ marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                <strong>{t.conditionLabel}</strong> {quickViewProduct.condition}
              </div>
            )}

            <div
              style={{
                fontSize: '14px',
                color: '#334155',
                lineHeight: '1.5',
                marginBottom: '20px',
              }}
            >
              {getLocalizedDesc(quickViewProduct)}
            </div>

            <button
              onClick={(e) => {
                setQuickViewProduct(null)
                handleAddToCart(e, quickViewProduct)
              }}
              style={{
                width: '100%',
                backgroundColor: '#000000',
                color: '#ffffff',
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
            backgroundColor: '#ffffff',
            borderLeft: isRtl ? 'transparent' : '4px solid #000000',
            borderRight: isRtl ? '4px solid #000000' : 'transparent',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '380px',
            color: '#000000',
            border: '1px solid #e2e8f0',
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

          <div style={{ fontSize: '20px', color: '#000000' }}>✓</div>

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
            <div style={{ fontSize: '12px', color: '#64748b' }}>{t.toastSuccess}</div>
          </div>

          <Link
            href={`/${currentLocale}/cart`}
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#ffffff',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              background: '#000000',
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
