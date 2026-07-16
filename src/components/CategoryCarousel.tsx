'use client'

import { useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { CATEGORY_MAP } from '@/utils/categories'
import SingleCategoryLink from './SingleCategoryLink'
import styles from '@/styles/category_carousel.module.css' // Import the extracted styles directly

interface CategoryCarouselProps {
  currentLocale: string
}

export default function CategoryCarousel({ currentLocale }: CategoryCarouselProps) {
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const activeLocale = (
    CATEGORY_MAP[currentLocale as 'en' | 'ar' | 'ckb'] ? currentLocale : 'en'
  ) as 'en' | 'ar' | 'ckb'

  // Sort reverse: Safely shallow copy array and invert the item sequence
  const items = useMemo(() => {
    const rawItems = CATEGORY_MAP[activeLocale] || []
    return [...rawItems].reverse()
  }, [activeLocale])

  // Setup layout tracking matrices
  const titleFont = isRtl ? '"Rudaw", sans-serif' : 'system-ui, sans-serif'

  // Handle Case Offers (Full build Offers) local translation strings dynamically
  const caseOffersTitle = useMemo(() => {
    if (activeLocale === 'ckb') return 'ئۆفەری کەیس'
    if (activeLocale === 'ar') return 'عروض الكيسات الكاملة'
    return 'Full Build Offers'
  }, [activeLocale])

  // Initialize Embla with layout-driven structural options
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    dragFree: true,
    direction: isRtl ? 'rtl' : 'ltr',
    align: 'start',
  })

  return (
    <div className={styles['embla-wrapper']} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <div className={styles['embla-viewport']} ref={emblaRef}>
        <div className={styles['embla-container']}>
          <div style={{ marginRight: '2rem' }}>
            <SingleCategoryLink
              key={0}
              titleFont={titleFont}
              title={caseOffersTitle}
              link={`/${activeLocale}/case-offers`}
            />
          </div>
          {items.map((category, index) => (
            <SingleCategoryLink
              key={index + 1}
              titleFont={titleFont}
              title={category.title}
              link={`/${activeLocale}?category=${category.slug}`}
            />
          ))}
          <div style={{ marginLeft: '2rem' }}>
            <p></p>
          </div>
        </div>
      </div>
    </div>
  )
}
