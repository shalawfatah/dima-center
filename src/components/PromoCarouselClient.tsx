'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'

interface PromoCarouselClientProps {
  promotions: any[]
  currentLocale: string
  isRtl: boolean
}

export default function PromoCarouselClient({
  promotions,
  currentLocale,
  isRtl,
}: PromoCarouselClientProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 30,
      direction: isRtl ? 'rtl' : 'ltr',
    },
    [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
      }),
    ],
  )

  const onSelect = useCallback((api: any) => {
    setActiveIndex(api.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    onSelect(emblaApi)
  }, [emblaApi, onSelect])

  const scrollToSlide = (index: number) => {
    if (!emblaApi) return
    emblaApi.scrollTo(index)
  }

  return (
    <section style={{ width: '100%', position: 'relative' }}>
      <style>{`
        .carousel-track {
          display: flex;
          touch-action: pan-y;
          user-select: none;
          -webkit-touch-callout: none;
        }
        .carousel-slide {
          flex: 0 0 100%;
          width: 100%;
          height: 400px;
          position: relative;
          overflow: hidden;
          display: block;
        }
        @media (max-width: 768px) {
          .carousel-slide {
            height: 280px;
          }
        }
        .dot-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
      `}</style>

      <div
        ref={emblaRef}
        style={{ overflow: 'hidden', width: '100%', cursor: 'grab', borderRadius: '.4rem' }}
        className="embla-viewport"
      >
        <div className="carousel-track" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          {promotions.map((promo: any) => {
            const imageUrl = promo.image && typeof promo.image === 'object' ? promo.image.url : null

            let targetUrl = promo.linkUrl || '#'
            if (promo.type === 'product' && promo.relatedProduct) {
              const prodId =
                typeof promo.relatedProduct === 'object'
                  ? promo.relatedProduct.id
                  : promo.relatedProduct
              targetUrl = `/${currentLocale}/products/${prodId}`
            }

            const slideContent = (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#df8026',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '3rem max(1.5rem, calc((100% - 1800px)/2))',
                  color: '#fff',
                  textAlign: isRtl ? 'right' : 'left',
                  position: 'relative',
                }}
              >
                {/* 🖼️ BACKGROUND IMAGE & TEXT READABILITY PROTECTION LAYER */}
                {imageUrl && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={promo.title || 'Promotion'}
                      width={1000}
                      height={400}
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                    />
                    {/* 🛡️ READABILITY OVERLAY: 
                      Creates a smooth gradient from a darkened bottom/middle (where the text sits) 
                      to transparent at the top. This makes white text pop perfectly on even plain white backgrounds.
                    */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.1) 100%)',
                        zIndex: 1,
                      }}
                    />
                  </div>
                )}

                {/* ✍️ TEXT CONTENT LAYER */}
                <div style={{ maxWidth: '600px', position: 'relative', zIndex: 2 }}>
                  {promo.type !== 'generic' && (
                    <span
                      style={{
                        fontFamily: '"Rudaw", sans-serif',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        background: promo.type === 'product' ? '#df8026' : '#10b981',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Visual pop-out
                      }}
                    >
                      {promo.type}
                    </span>
                  )}
                  <h2
                    style={{
                      fontFamily: '"Rudaw", sans-serif',
                      fontSize: '2.25rem',
                      fontWeight: '800',
                      marginTop: '0.5rem',
                      marginBottom: '0.5rem',
                      lineHeight: '1.2',
                      // Text shadow ensures separation on bright patches
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {promo.title}
                  </h2>
                  {promo.description && (
                    <p
                      style={{
                        fontFamily: '"Sarchia", sans-serif',
                        fontSize: '1rem',
                        color: '#f1f5f9', // Brighter text color shade for crisp contrast over darker gradient
                        marginBottom: '1rem',
                        lineHeight: '1.5',
                        textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {promo.description}
                    </p>
                  )}
                </div>
              </div>
            )

            return promo.type === 'product' || promo.linkUrl ? (
              <Link
                key={promo.id}
                href={targetUrl}
                className="carousel-slide"
                style={{ textDecoration: 'none' }}
                draggable={false}
              >
                {slideContent}
              </Link>
            ) : (
              <div key={promo.id} className="carousel-slide">
                {slideContent}
              </div>
            )
          })}
        </div>
      </div>

      {promotions.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10,
            background: 'rgba(0,0,0,0.3)',
            padding: '6px 12px',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {promotions.map((_, index) => (
            <button
              key={index}
              className="dot-indicator"
              onClick={() => scrollToSlide(index)}
              style={{
                backgroundColor: activeIndex === index ? '#fff' : 'rgba(255, 255, 255, 0.4)',
                transform: activeIndex === index ? 'scale(1.2)' : 'scale(1)',
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
