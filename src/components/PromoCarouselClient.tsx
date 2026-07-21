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

// Helper to handle client-side localization fallbacks (Target -> EN -> Any available)
function getLocalizedField(field: any, currentLocale: string): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field[currentLocale] || field.en || field.ar || field.ckb || ''
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
            const title = getLocalizedField(promo.title, currentLocale)
            const description = getLocalizedField(promo.description, currentLocale)

            // Resolve dynamic links based on UIProducts schema (linkType: 'product' | 'static' | 'none')
            let targetUrl: string | null = null
            let shouldLink = false

            if (promo.linkType === 'product' && promo.linkedProduct) {
              const prodId =
                typeof promo.linkedProduct === 'object'
                  ? promo.linkedProduct.id
                  : promo.linkedProduct
              targetUrl = `/${currentLocale}/products/${prodId}`
              shouldLink = true
            } else if (promo.linkType === 'static' && promo.staticUrl) {
              targetUrl = promo.staticUrl.startsWith('http')
                ? promo.staticUrl
                : `/${currentLocale}${promo.staticUrl.startsWith('/') ? '' : '/'}${promo.staticUrl}`
              shouldLink = true
            }

            // Category badge label (localized)
            const categoryTitle =
              promo.uiCategory && typeof promo.uiCategory === 'object'
                ? getLocalizedField(promo.uiCategory.title, currentLocale)
                : null

            const slideContent = (
              <div className={styles.promoWrapper} style={{ textAlign: isRtl ? 'right' : 'left' }}>
                {/* 🖼️ BACKGROUND IMAGE & OVERLAY */}
                {imageUrl && (
                  <div className={styles.imageWrapper}>
                    <Image
                      src={imageUrl}
                      alt={title || 'Promotion'}
                      width={1000}
                      height={400}
                      draggable={false}
                      className={styles.bgImage}
                      style={{ height: 'auto' }}
                    />
                    <div className={styles.overlay} />
                  </div>
                )}

                {/* ✍️ TEXT CONTENT LAYER */}
                <div className={styles.textContent}>
                  {categoryTitle && (
                    <span className={`${styles.badge} ${styles.badgeProduct}`}>
                      {categoryTitle}
                    </span>
                  )}
                  {title && <h2 className={styles.title}>{title}</h2>}
                  {description && <p className={styles.description}>{description}</p>}
                </div>
              </div>
            )

            // Render clickable Link ONLY when linkType specifies a valid URL
            return shouldLink && targetUrl ? (
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
