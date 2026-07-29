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

/**
 * Safely resolves localized fields with strict fallback hierarchy:
 * Preferred Locale -> EN -> CKB -> AR -> Any available non-empty string
 */
function getLocalizedField(field: any, currentLocale: string): string {
  if (!field) return ''

  // 1. Direct string check
  if (typeof field === 'string' && field.trim()) return field.trim()

  // 2. Handle localized object structure: { en: '...', ckb: '...', ar: '...' }
  if (typeof field === 'object' && field !== null) {
    // A. Requested locale
    if (
      field[currentLocale] &&
      typeof field[currentLocale] === 'string' &&
      field[currentLocale].trim()
    ) {
      return field[currentLocale].trim()
    }

    // B. Preferred fallbacks in order
    const priorityKeys = ['en', 'ckb', 'ar']
    for (const key of priorityKeys) {
      if (field[key] && typeof field[key] === 'string' && field[key].trim()) {
        return field[key].trim()
      }
    }

    // C. Scan all object values for ANY non-empty string
    for (const val of Object.values(field)) {
      if (typeof val === 'string' && val.trim()) {
        return val.trim()
      }
      if (typeof val === 'object' && val !== null) {
        const nested = getLocalizedField(val, currentLocale)
        if (nested) return nested
      }
    }
  }

  return ''
}

// 🎯 Safe helper to extract category slug from populated relation
function getCategorySlug(product: any): string {
  if (!product || typeof product !== 'object') return 'all'

  const catObj = product.category || product.uiCategory
  if (typeof catObj === 'object' && catObj?.slug) {
    return catObj.slug
  }

  return 'all'
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

    // Register event listeners
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    // Defer initial sync to avoid synchronous setState inside the effect body
    queueMicrotask(() => {
      onSelect(emblaApi)
    })

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
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

            // Fallback chain: promo.title -> linkedProduct.title -> promo.name
            const rawTitle = promo.title || promo.linkedProduct?.title || promo.name
            const title = getLocalizedField(rawTitle, currentLocale)

            const rawDescription = promo.description || promo.linkedProduct?.description
            const description = getLocalizedField(rawDescription, currentLocale)

            // Resolve dynamic links matching the rest of the application (category_slug/product_id)
            let targetUrl: string | null = null
            let shouldLink = false

            if (promo.linkType === 'product' && promo.linkedProduct) {
              const linked = promo.linkedProduct
              const prodId = typeof linked === 'object' ? linked.id : linked
              const catSlug = getCategorySlug(linked)

              // Resolves to /[locale]/[category_slug]/[id]
              targetUrl = `/${currentLocale}/${catSlug}/${prodId}`
              shouldLink = true
            } else if (promo.linkType === 'static' && promo.staticUrl) {
              targetUrl = promo.staticUrl.startsWith('http')
                ? promo.staticUrl
                : `/${currentLocale}${promo.staticUrl.startsWith('/') ? '' : '/'}${promo.staticUrl}`
              shouldLink = true
            }

            const slideContent = (
              <div className={styles.promoWrapper} style={{ textAlign: 'center' }}>
                {/* 🖼️ BACKGROUND IMAGE & OVERLAY */}
                {imageUrl && (
                  <div className={styles.imageWrapper}>
                    <Image
                      src={imageUrl}
                      alt={title || 'Promotion'}
                      fill
                      sizes="100vw"
                      draggable={false}
                      className={styles.bgImage}
                      priority={activeIndex === 0}
                    />
                    <div className={styles.overlay} />
                  </div>
                )}

                {/* ✍️ TEXT CONTENT LAYER */}
                <div className={styles.textContent}>
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
