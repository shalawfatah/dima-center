'use client'

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { EngineType } from 'embla-carousel'
import Image from 'next/image'
import { ProductCarouselProps, ProductItem } from '@/types/types'
import styles from '@/styles/product_carousel.module.css'

// 🎯 Extended the component props interface to accept custom sizing safely
interface ExtendedProductCarouselProps extends ProductCarouselProps {
  cardWidth?: number // Optional, defaults to 220
  cardHeight?: number // Optional, defaults to 300
}

export default function ProductCarousel({
  products,
  currentLocale,
  isRtl,
  onAddToCart,
  linkResolver,
  cardWidth = 220, // Default fallback width
  cardHeight = 300, // Default fallback height
}: ExtendedProductCarouselProps) {
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

  // Helper to check if product belongs to the "monitor" category
  const isMonitorCategory = (product: ProductItem): boolean => {
    if (!product.category) return false

    if (typeof product.category === 'object') {
      const cat = product.category as any
      const slug = String(cat.slug || '').toLowerCase()
      const titleEn = String(cat.title?.en || cat.title || '').toLowerCase()
      const nameEn = String(cat.name?.en || cat.name || '').toLowerCase()

      return (
        slug === 'monitor' ||
        slug === 'monitors' ||
        slug === 'titleen' ||
        titleEn === 'monitor' ||
        titleEn === 'monitors' ||
        nameEn === 'monitor' ||
        nameEn === 'monitors'
      )
    }

    return String(product.category).toLowerCase() === 'monitor'
  }

  // Partition & Sort the products list
  const sortedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return []

    const manualOffers: ProductItem[] = []
    const discountedProducts: ProductItem[] = []
    const monitorProducts: ProductItem[] = []
    const defaultProducts: ProductItem[] = []

    products.forEach((product) => {
      if (product.isCaseOffer) {
        manualOffers.push(product)
      } else if (product.hasDiscount) {
        discountedProducts.push(product)
      } else if (isMonitorCategory(product)) {
        monitorProducts.push(product)
      } else {
        defaultProducts.push(product)
      }
    })

    return [...manualOffers, ...discountedProducts, ...monitorProducts, ...defaultProducts]
  }, [products])

  // Dynamic routing path resolver
  const getProductPath = (product: ProductItem): string => {
    if (linkResolver) return linkResolver(product)
    const routeSegment = product.isCaseOffer ? 'case-offers' : 'products'
    return `/${currentLocale}/${routeSegment}/${product.id}`
  }

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

      const imgLayer = slide.querySelector(`.${styles['product-parallax-img']}`) as HTMLElement
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

  const getNumericalPrice = (price: number | string | null | undefined): number => {
    if (price === null || price === undefined) return 0
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
      'ئێنتێل کۆر i9-14900K': {
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
    const targetUrl = `${window.location.origin}${getProductPath(product)}`

    if (navigator.share) {
      navigator
        .share({
          title: localizedTitle,
          url: targetUrl,
        })
        .catch(console.error)
    } else {
      navigator.clipboard.writeText(targetUrl)
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

  const IQDBadge = ({ amount }: { amount: number }) => (
    <span className={styles['pc-iqd-badge']}>{amount.toLocaleString()} IQD د.ع</span>
  )

  const rootVars = {
    '--pc-title-font': titleFont,
    '--pc-text-font': textFont,
  } as React.CSSProperties

  return (
    <div className={styles['pc-wrapper']} data-dir={isRtl ? 'rtl' : 'ltr'} style={rootVars}>
      <div ref={emblaRef} className={styles['pc-viewport']}>
        <div className={styles['product-carousel-track']}>
          {sortedProducts.map((product) => {
            const currentTitle = getLocalizedTitle(product)
            const imageUrl =
              typeof product.featuredImage === 'object' ? product.featuredImage?.url : null
            const imageAlt =
              typeof product.featuredImage === 'object' ? product.featuredImage?.alt : currentTitle

            const hasDiscount = !!product.hasDiscount
            const originalPrice = getNumericalPrice(product.price)
            const finalPrice = getDiscountedPrice(product)
            const priceIQDValue =
              product.priceIQD !== null && product.priceIQD !== undefined
                ? getNumericalPrice(product.priceIQD)
                : null

            return (
              <Link
                key={product.id}
                href={getProductPath(product)}
                className={`${styles['product-carousel-slide']} ${styles['pc-slide-link']}`}
                draggable={false}
                // 🎯 Dynamically binds explicit values down into CSS architecture variables
                style={
                  {
                    '--pc-card-width': `${cardWidth}px`,
                    '--pc-card-height': `${cardHeight}px`,
                  } as React.CSSProperties
                }
              >
                <div className={styles['product-card-inner']}>
                  {hasDiscount && (
                    <div className={styles['pc-discount-badge']}>
                      {product.discountType === 'percentage'
                        ? `-${product.discountValue}%\u00A0${t.discountLabel}`
                        : `-$${product.discountValue}\u00A0${t.discountLabel}`}
                    </div>
                  )}

                  <div className={styles['pc-image-container']}>
                    {imageUrl ? (
                      <Image
                        width={cardWidth}
                        height={cardHeight}
                        src={imageUrl}
                        alt={imageAlt || currentTitle}
                        className={styles['product-parallax-img']}
                        priority={false}
                      />
                    ) : (
                      <div className={styles['pc-image-placeholder']}>📦</div>
                    )}
                  </div>

                  <div className={styles['side-actions-wrapper']}>
                    <button
                      className={styles['side-action-btn']}
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
                      className={styles['side-action-btn']}
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

                  <div className={styles['pc-info-panel']}>
                    <h3 className={styles['pc-title']}>{currentTitle}</h3>

                    <div className={styles['pc-price-container']}>
                      <div className={styles['pc-price-row']}>
                        {hasDiscount ? (
                          <div className={styles['pc-price-group']}>
                            <span className={styles['pc-price-final']}>
                              {t.currency}
                              {finalPrice.toLocaleString()}
                            </span>
                            <span className={styles['pc-price-original']}>
                              {t.currency}
                              {originalPrice.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className={styles['pc-price-final']}>
                            {t.currency}
                            {originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {priceIQDValue !== null && priceIQDValue > 0 && (
                        <IQDBadge amount={priceIQDValue} />
                      )}
                    </div>
                  </div>

                  <div className={styles['hover-cart-overlay']}>
                    <button
                      className={styles['hover-cart-btn']}
                      onClick={(e) => handleAddToCart(e, product)}
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
        <div className={styles['pc-modal-backdrop']} onClick={() => setQuickViewProduct(null)}>
          <div className={styles['pc-modal-content']} onClick={(e) => e.stopPropagation()}>
            <button className={styles['pc-modal-close']} onClick={() => setQuickViewProduct(null)}>
              ✕
            </button>

            <h2 className={styles['pc-modal-title']}>{getLocalizedTitle(quickViewProduct)}</h2>

            <div className={styles['pc-modal-price-row']}>
              <div className={styles['pc-modal-price']}>
                {quickViewProduct.hasDiscount
                  ? `${t.currency}${getDiscountedPrice(quickViewProduct).toLocaleString()}`
                  : `${t.currency}${getNumericalPrice(quickViewProduct.price).toLocaleString()}`}
              </div>

              {quickViewProduct.priceIQD !== null &&
                quickViewProduct.priceIQD !== undefined &&
                getNumericalPrice(quickViewProduct.priceIQD) > 0 && (
                  <IQDBadge amount={getNumericalPrice(quickViewProduct.priceIQD)} />
                )}
            </div>

            {quickViewProduct.condition && (
              <div className={styles['pc-modal-condition']}>
                <strong>{t.conditionLabel}</strong> {quickViewProduct.condition}
              </div>
            )}

            <div className={styles['pc-modal-desc']}>{getLocalizedDesc(quickViewProduct)}</div>

            <button
              className={styles['pc-modal-addcart']}
              onClick={(e) => {
                setQuickViewProduct(null)
                handleAddToCart(e, quickViewProduct)
              }}
            >
              {t.addToCart}
            </button>
          </div>
        </div>
      )}

      {toastProduct && (
        <div className={styles['pc-toast']}>
          <div className={styles['pc-toast-check']}>✓</div>

          <div className={styles['pc-toast-text']}>
            <div className={styles['pc-toast-title']}>{getLocalizedTitle(toastProduct)}</div>
            <div className={styles['pc-toast-subtitle']}>{t.toastSuccess}</div>
          </div>

          <Link href={`/${currentLocale}/cart`} className={styles['pc-toast-cta']}>
            {t.viewCart}
          </Link>
        </div>
      )}
    </div>
  )
}
