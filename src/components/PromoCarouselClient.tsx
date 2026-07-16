'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import styles from '@/styles/promo_carousel.module.css'

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
    <section className={styles.carouselSection}>
      <div ref={emblaRef} className={styles.viewport}>
        <div className={styles.track} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
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
              <div className={styles.promoWrapper} style={{ textAlign: isRtl ? 'right' : 'left' }}>
                {/* 🖼️ BACKGROUND IMAGE & OVERLAY */}
                {imageUrl && (
                  <div className={styles.imageWrapper}>
                    <Image
                      src={imageUrl}
                      alt={promo.title || 'Promotion'}
                      width={1000}
                      height={400}
                      draggable={false}
                      className={styles.bgImage}
                      style={{ height: 'auto' }} // Keeps Next.js from throwing aspect ratio warnings
                    />
                    <div className={styles.overlay} />
                  </div>
                )}

                {/* ✍️ TEXT CONTENT LAYER */}
                <div className={styles.textContent}>
                  {promo.type !== 'generic' && (
                    <span
                      className={`${styles.badge} ${
                        promo.type === 'product' ? styles.badgeProduct : styles.badgeGeneric
                      }`}
                    >
                      {promo.type}
                    </span>
                  )}
                  <h2 className={styles.title}>{promo.title}</h2>
                  {promo.description && <p className={styles.description}>{promo.description}</p>}
                </div>
              </div>
            )

            return promo.type === 'product' || promo.linkUrl ? (
              <Link key={promo.id} href={targetUrl} className={styles.slide} draggable={false}>
                {slideContent}
              </Link>
            ) : (
              <div key={promo.id} className={styles.slide}>
                {slideContent}
              </div>
            )
          })}
        </div>
      </div>

      {promotions.length > 1 && (
        <div className={styles.dotsContainer}>
          {promotions.map((_, index) => (
            <button
              key={index}
              className={styles.dotIndicator}
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
