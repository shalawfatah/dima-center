'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'

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
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Mouse Drag Tracking States
  const isDown = useRef(false)
  const startX = useRef(0)
  const scrollLeftState = useRef(0)
  const isDragging = useRef(false) // Prevents accidental links clicking while dragging

  // 1. Dynamic Scroll Tracking for Dots
  const handleScroll = () => {
    if (!trackRef.current || isDown.current) return
    const { scrollLeft, clientWidth } = trackRef.current
    const index = Math.round(Math.abs(scrollLeft) / clientWidth)
    if (index >= 0 && index < promotions.length) {
      setActiveIndex(index)
    }
  }

  const scrollToSlide = (index: number) => {
    if (!trackRef.current) return
    const clientWidth = trackRef.current.clientWidth
    const targetScroll = isRtl ? -index * clientWidth : index * clientWidth

    trackRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })
    setActiveIndex(index)
  }

  // 2. 5-Second Autoplay Engine
  useEffect(() => {
    if (promotions.length <= 1) return

    const interval = setInterval(() => {
      // If user is actively dragging with mouse, skip this cycle
      if (isDown.current) return

      setActiveIndex((prevIndex) => {
        const nextIndex = prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
        scrollToSlide(nextIndex)
        return nextIndex
      })
    }, 5000) // 5000ms = 5 Seconds

    return () => clearInterval(interval)
  }, [promotions.length])

  // 3. Desktop Mouse Drag Mechanics
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return
    isDown.current = true
    isDragging.current = false
    trackRef.current.style.scrollSnapType = 'none' // Temporarily disable snapping during raw drag
    startX.current = e.pageX - trackRef.current.offsetLeft
    scrollLeftState.current = trackRef.current.scrollLeft
  }

  const handleMouseLeave = () => {
    if (!isDown.current) return
    isDown.current = false
    snapToNearest()
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    isDown.current = false
    // If they actually moved the mouse, intercept the click so it doesn't open links accidentally
    if (isDragging.current) {
      e.preventDefault()
    }
    snapToNearest()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !trackRef.current) return
    e.preventDefault()
    const x = e.pageX - trackRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5 // Multiplier adjustments control drag speed sensitivity

    if (Math.abs(walk) > 5) {
      isDragging.current = true // Confirms they are intent-dragging, not just clicking
    }

    trackRef.current.scrollLeft = scrollLeftState.current - walk
  }

  // Clean snap placement evaluation when releasing drag actions
  const snapToNearest = () => {
    if (!trackRef.current) return
    trackRef.current.style.scrollSnapType = 'x mandatory' // Re-enable beautiful standard snapping
    const { scrollLeft, clientWidth } = trackRef.current
    const index = Math.round(Math.abs(scrollLeft) / clientWidth)
    scrollToSlide(index)
  }

  return (
    <section style={{ width: '100%', position: 'relative', marginBottom: '2rem' }}>
      <style>{`
        .carousel-track {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          cursor: grab;
        }
        .carousel-track:active {
          cursor: grabbing;
        }
        .carousel-track::-webkit-scrollbar {
          display: none;
        }
        .carousel-slide {
          flex: 0 0 100%;
          width: 100%;
          height: 350px;
          scroll-snap-align: start;
          position: relative;
          user-select: none;
          -webkit-user-drag: none;
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
        className="carousel-track"
        ref={trackRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
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
                backgroundImage: imageUrl
                  ? `linear-gradient(to top, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.2) 100%), url(${imageUrl})`
                  : 'none',
                backgroundColor: '#1e293b',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '3rem max(1.5rem, calc((100% - 1200px)/2))',
                color: '#fff',
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              <div style={{ maxWidth: '600px' }}>
                {promo.type !== 'generic' && (
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      background: promo.type === 'product' ? '#3b82f6' : '#10b981',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                    }}
                  >
                    {promo.type}
                  </span>
                )}
                <h2
                  style={{
                    fontSize: '2.25rem',
                    fontWeight: '800',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem',
                    lineHeight: '1.2',
                  }}
                >
                  {promo.title}
                </h2>
                {promo.description && (
                  <p
                    style={{
                      fontSize: '1rem',
                      color: '#cbd5e1',
                      marginBottom: '1rem',
                      lineHeight: '1.5',
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
              onClick={(e) => {
                // Critical: If they were pulling/dragging the slider with mouse, prevent Link fire
                if (isDragging.current) e.preventDefault()
              }}
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
