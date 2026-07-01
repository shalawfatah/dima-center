'use client'

import React, { useCallback, useEffect } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { EngineType } from 'embla-carousel'
import Image from 'next/image'

interface ProductItem {
  id: string
  title: string
  price: number | string
  condition?: string
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
}

export default function ProductCarousel({ products, currentLocale, isRtl }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    duration: 25,
    dragFree: true,
    containScroll: 'trimSnaps',
    direction: isRtl ? 'rtl' : 'ltr',
  })

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

      // 🎯 THE FIX: Cap the max displacement.
      // With width: 130% and left/right: -15%, the absolute maximum safe translateX
      // relative to the image's own size is roughly 11.5% before a gap shows.
      const parallaxFactor = 0.15
      let xTranslation = diffToTarget * (-1 * parallaxFactor * 100)

      // Clamp the value between -11% and 11% to keep the image safely anchored inside the card mask
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
  const textFont = isRegionalLocale ? '"Sarchia", sans-serif' : 'inherit'

  return (
    <div style={{ width: '100%', overflow: 'hidden', padding: '1rem 0' }}>
      <style>{`
        .product-carousel-track {
          display: flex;
          touch-action: pan-y;
        }
        .product-carousel-slide {
          flex: 0 0 calc(100% / 2 - 12px); 
          min-width: 0;
        }
        @media (min-width: 480px) {
          .product-carousel-slide { flex: 0 0 calc(100% / 3 - 12px); }
        }
        @media (min-width: 768px) {
          .product-carousel-slide { flex: 0 0 calc(100% / 4 - 14px); }
        }
        @media (min-width: 1024px) {
          .product-carousel-slide { flex: 0 0 calc(100% / 5 - 14px); }
        }
        @media (min-width: 1280px) {
          .product-carousel-slide { flex: 0 0 calc(100% / 6 - 16px); }
        }
        @media (min-width: 1440px) {
          .product-carousel-slide { flex: 0 0 calc(100% / 7 - 16px); }
        }
      `}</style>

      <div ref={emblaRef} style={{ overflow: 'hidden', width: '100%', cursor: 'grab' }}>
        <div
          className="product-carousel-track"
          style={{ gap: '16px', direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {products.map((product) => {
            const imageUrl =
              typeof product.featuredImage === 'object' ? product.featuredImage?.url : null
            const imageAlt =
              typeof product.featuredImage === 'object' ? product.featuredImage?.alt : product.title

            return (
              <Link
                key={product.id}
                href={`/${currentLocale}/products/${product.id}`}
                className="product-carousel-slide"
                style={{ textDecoration: 'none', color: 'inherit' }}
                draggable={false}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#1e293b',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1 }}>
                    {imageUrl ? (
                      <Image
                        className="product-parallax-img"
                        width={250}
                        height={250}
                        src={imageUrl}
                        alt={imageAlt || product.title}
                        style={{
                          width: '130%',
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          // 🎯 FIX: Remove conditional LTR/RTL offsets.
                          // This perfectly centers the 130% wide image on both LTR and RTL viewports.
                          left: '0',
                          willChange: 'transform',
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
                          'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 45%, rgba(0,0,0,0) 100%)',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 2,
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: titleFont,
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#fff',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {product.title}
                    </h3>

                    <span
                      style={{
                        fontFamily: textFont,
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#10b981',
                      }}
                    >
                      {product.price} IQD
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
