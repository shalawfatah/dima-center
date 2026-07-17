'use client'

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { EngineType } from 'embla-carousel'
import Image from 'next/image'
import { ProductCarouselProps, ProductItem } from '@/types/types'
import styles from '@/styles/product_carousel.module.css'

interface ExtendedProductCarouselProps extends ProductCarouselProps {
  cardWidth?: number
  cardHeight?: number
}

export default function ProductCarousel({
  products,
  currentLocale,
  isRtl,
  onAddToCart,
  linkResolver,
  cardWidth = 220,
  cardHeight = 300,
}: ExtendedProductCarouselProps) {
  // Fast directional flip string setup
  const emblaDirection = isRtl ? 'rtl' : 'ltr'

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    duration: 20, // Slightly snappier transition duration
    dragFree: true,
    containScroll: 'trimSnaps',
    direction: emblaDirection,
  })

  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null)
  const [toastProduct, setToastProduct] = useState<ProductItem | null>(null)

  useEffect(() => {
    if (!toastProduct) return
    const timer = setTimeout(() => setToastProduct(null), 4000)
    return () => clearTimeout(timer)
  }, [toastProduct])

  const isMonitorCategory = useCallback((product: ProductItem): boolean => {
    if (!product.category) return false

    if (typeof product.category === 'object') {
      const cat = product.category as any
      const slug = String(cat.slug || '').toLowerCase()
      const titleEn = String(cat.title?.en || cat.title || '').toLowerCase()
      const nameEn = String(cat.name?.en || cat.name || '').toLowerCase()

      return (
        slug === 'monitor' || slug === 'monitors' || titleEn === 'monitor' || nameEn === 'monitor'
      )
    }
    return String(product.category).toLowerCase() === 'monitor'
  }, [])

  // Optimized sorting pass running smoothly on props transitions
  const sortedProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return []

    const manualOffers: ProductItem[] = []
    const discountedProducts: ProductItem[] = []
    const monitorProducts: ProductItem[] = []
    const defaultProducts: ProductItem[] = []

    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      if (product.isCaseOffer) {
        manualOffers.push(product)
      } else if (product.hasDiscount) {
        discountedProducts.push(product)
      } else if (isMonitorCategory(product)) {
        monitorProducts.push(product)
      } else {
        defaultProducts.push(product)
      }
    }

    return [...manualOffers, ...discountedProducts, ...monitorProducts, ...defaultProducts]
  }, [products, isMonitorCategory])

  const getProductPath = useCallback(
    (product: ProductItem): string => {
      if (linkResolver) return linkResolver(product)
      const routeSegment = product.isCaseOffer ? 'case-offers' : 'products'
      return `/${currentLocale}/${routeSegment}/${product.id}`
    },
    [currentLocale, linkResolver],
  )

  // Parallax translation scrolling logic
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

      const parallaxFactor = 0.12
      let xTranslation = diffToTarget * (-1 * parallaxFactor * 100)
      xTranslation = Math.max(-10, Math.min(10, xTranslation))

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

  const getNumericalPrice = (price: number | string | null | undefined): number => {
    if (!price) return 0
    if (typeof price === 'string') {
      return parseFloat(price.replace(/,/g, '')) || 0
    }
    return price
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
    const rawFieldVal = product[fieldType] || ''

    // Explicit localized template object configuration matching
    const langKey = currentLocale === 'ar' || currentLocale === 'ckb' ? currentLocale : 'en'
    if (product[`${fieldType}_${langKey}`]) {
      return product[`${fieldType}_${langKey}`]
    }
    return rawFieldVal
  }

  const getLocalizedTitle = (product: ProductItem | null) => getFallbackText(product, 'title')
  const getLocalizedDesc = (product: ProductItem | null) => getFallbackText(product, 'description')

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
          imageUrl: typeof product.featuredImage === 'object' ? product.featuredImage?.url : null,
        })
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))
      setToastProduct(product)
    } catch (err) {
      console.error('Localstorage execution error:', err)
    }
  }

  const carouselDictionary = {
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
    <div
      className={styles['pc-wrapper']}
      data-dir={emblaDirection}
      style={
        { '--pc-title-font': isRtl ? '"Rudaw", sans-serif' : 'inherit' } as React.CSSProperties
      }
    >
      <div ref={emblaRef} className={styles['pc-viewport']}>
        <div className={styles['product-carousel-track']}>
          {sortedProducts.map((product) => {
            const currentTitle = getLocalizedTitle(product)

            // Fixed Fallback Check: Safely parsing nested payload data paths
            const imageUrl =
              product.featuredImage && typeof product.featuredImage === 'object'
                ? product.featuredImage.url
                : null

            const imageAlt =
              product.featuredImage && typeof product.featuredImage === 'object'
                ? product.featuredImage.alt || currentTitle
                : currentTitle

            const hasDiscount = !!product.hasDiscount
            const originalPrice = getNumericalPrice(product.price)
            const finalPrice = getDiscountedPrice(product)
            const priceIQDValue = product.priceIQD ? getNumericalPrice(product.priceIQD) : null

            return (
              <Link
                key={product.id}
                href={getProductPath(product)}
                className={`${styles['product-carousel-slide']} ${styles['pc-slide-link']}`}
                draggable={false}
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
                        ? `-${product.discountValue}% ${t.discountLabel}`
                        : `-$${product.discountValue} ${t.discountLabel}`}
                    </div>
                  )}

                  <div className={styles['pc-image-container']}>
                    {imageUrl ? (
                      <Image
                        width={cardWidth}
                        height={cardHeight}
                        src={imageUrl}
                        alt={imageAlt}
                        className={styles['product-parallax-img']}
                        priority={false}
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    ) : (
                      <div className={styles['pc-image-placeholder']}>📦</div>
                    )}
                  </div>

                  {/* Operational Action Layer */}
                  <div className={styles['side-actions-wrapper']}>
                    <button
                      className={styles['side-action-btn']}
                      onClick={(e) => {
                        e.preventDefault()
                        setQuickViewProduct(product)
                      }}
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
                      onClick={(e) => {
                        e.preventDefault()
                        const targetUrl = `${window.location.origin}${getProductPath(product)}`
                        navigator.clipboard.writeText(targetUrl)
                        alert('Copied!')
                      }}
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

                  {/* Content Details Block */}
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
                        <span className={styles['pc-iqd-badge']}>
                          {priceIQDValue.toLocaleString()} IQD د.ع
                        </span>
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

      {/* MODAL & TOAST COMPONENT HOOKS */}
      {quickViewProduct && (
        <div className={styles['pc-modal-backdrop']} onClick={() => setQuickViewProduct(null)}>
          <div className={styles['pc-modal-content']} onClick={(e) => e.stopPropagation()}>
            <button className={styles['pc-modal-close']} onClick={() => setQuickViewProduct(null)}>
              ✕
            </button>
            <h2 className={styles['pc-modal-title']}>{getLocalizedTitle(quickViewProduct)}</h2>
            <div className={styles['pc-modal-price']}>
              {quickViewProduct.hasDiscount
                ? `${t.currency}${getDiscountedPrice(quickViewProduct).toLocaleString()}`
                : `${t.currency}${getNumericalPrice(quickViewProduct.price).toLocaleString()}`}
            </div>
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
    </div>
  )
}
