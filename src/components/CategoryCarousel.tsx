'use client'

import { useCallback, useMemo } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { CATEGORY_MAP } from '@/utils/categories'

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

  // Initialize Embla with layout-driven structural options
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: true,
    direction: isRtl ? 'rtl' : 'ltr',
    align: 'start',
  })

  // Action hook handlers for customized controls
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <>
      <style>{`
        .embla-wrapper {
          position: relative;
          width: 100%;
          max-width: 1800px;
          background-color: #ffffff;
          margin: 0 auto;
          padding: 1rem 1rem;
        }
        .embla-viewport {
          overflow: hidden;
          width: 100%;
        }
        .embla-container {
          display: flex;
          gap: 1rem;
          user-select: none;
          -webkit-touch-callout: none;
        }
        .embla-slide {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .text-badge-container {
          min-width: 130px;
          padding: 12px 20px;
          border-radius: 30px;
          background-color: #F3F3F3;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          position: relative;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .text-badge-container:hover {
          transform: translateY(-2px);
          background-color: #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .arrow-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: white;
          border: 1px solid #eaeaea;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #ffb83c;
          z-index: 10;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
          transition: background-color 0.2s, transform 0.2s;
        }
        .arrow-button:hover {
          background-color: #ffb83c;
          color: white;
        }
        .arrow-left {
          left: -10px;
        }
        .arrow-right {
          right: -10px;
        }
      `}</style>

      <div className="embla-wrapper" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        {/* Carousel Viewport Container */}
        <div className="embla-viewport" ref={emblaRef}>
          <div className="embla-container">
            {items.map((category, index) => (
              <div className="embla-slide" key={index}>
                <Link
                  href={`/${activeLocale}?category=${category.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="text-badge-container">
                    <span
                      style={{
                        fontFamily: titleFont,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e293b',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {category.title}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <button
          className="arrow-button arrow-left"
          onClick={isRtl ? scrollNext : scrollPrev}
          aria-label="Previous Slide"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          className="arrow-button arrow-right"
          onClick={isRtl ? scrollPrev : scrollNext}
          aria-label="Next Slide"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </>
  )
}
