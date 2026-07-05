'use client'

import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'

interface ProductGalleryProps {
  title: string
  featuredImageUrl?: string | null
  imagesGallery?: any[] | null
  isRtl?: boolean
}

// --- Small inline icon set (kept dependency-free, no icon library required) ---

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  )
}

export default function ProductGallery({
  title,
  featuredImageUrl,
  imagesGallery,
  isRtl = false,
}: ProductGalleryProps) {
  // 1. Robust normalization to safely parse Payload CMS image structures
  const galleryArray = Array.isArray(imagesGallery) ? imagesGallery : []
  const allImages: string[] = []

  // Add the primary featured image first
  if (featuredImageUrl) {
    allImages.push(featuredImageUrl)
  }

  // Deep extract secondary strings from the gallery array safely
  galleryArray.forEach((img: any) => {
    if (!img) return

    let url: string | null = null

    if (typeof img === 'string') {
      url = img
    } else if (typeof img === 'object') {
      // Handles standard relationship fields { url: '...' }
      // or block-wrapped relationships { image: { url: '...' } }
      url = img.url || img.image?.url || (typeof img.image === 'string' ? img.image : null)
    }

    if (url && !allImages.includes(url)) {
      allImages.push(url)
    }
  })

  // State management for current active slider index
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Full-screen lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Initialize Embla viewports
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    loop: true,
    direction: isRtl ? 'rtl' : 'ltr',
  })
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    direction: isRtl ? 'rtl' : 'ltr',
  })

  // Synchronized item slide indicator callbacks
  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return

    let current = 0
    if (typeof emblaMainApi.selectedScrollSnap === 'function') {
      current = emblaMainApi.selectedScrollSnap()
    } else if (typeof (emblaMainApi as any).selectedSnap === 'function') {
      current = (emblaMainApi as any).selectedSnap()
    } else {
      return
    }

    setSelectedIndex(current)

    if (typeof emblaThumbsApi.scrollTo === 'function') {
      emblaThumbsApi.scrollTo(current)
    }
  }, [emblaMainApi, emblaThumbsApi])

  // Attach lifestyle triggers
  useEffect(() => {
    if (!emblaMainApi) return

    onSelect()

    if (typeof emblaMainApi.on === 'function') {
      emblaMainApi.on('select', onSelect)
      emblaMainApi.on('reInit', onSelect)
    }

    return () => {
      if (emblaMainApi && typeof emblaMainApi.off === 'function') {
        emblaMainApi.off('select', onSelect)
        emblaMainApi.off('reInit', onSelect)
      }
    }
  }, [emblaMainApi, onSelect])

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || typeof emblaMainApi.scrollTo !== 'function') return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi],
  )

  // --- Lightbox controls ---

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => setIsLightboxOpen(false), [])

  const showNext = useCallback(() => {
    setLightboxIndex((prev) => {
      const next = (prev + 1) % allImages.length
      if (emblaMainApi && typeof emblaMainApi.scrollTo === 'function') {
        emblaMainApi.scrollTo(next)
      }
      return next
    })
  }, [allImages.length, emblaMainApi])

  const showPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      const next = (prev - 1 + allImages.length) % allImages.length
      if (emblaMainApi && typeof emblaMainApi.scrollTo === 'function') {
        emblaMainApi.scrollTo(next)
      }
      return next
    })
  }, [allImages.length, emblaMainApi])

  // Keyboard navigation + body scroll lock while the lightbox is open
  useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') isRtl ? showPrev() : showNext()
      if (e.key === 'ArrowLeft') isRtl ? showNext() : showPrev()
    }

    document.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isLightboxOpen, closeLightbox, showNext, showPrev, isRtl])

  const lightbox = isLightboxOpen && (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} full screen image viewer`}
      onClick={closeLightbox}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        type="button"
        onClick={closeLightbox}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
        }}
      >
        <CloseIcon />
      </button>

      {allImages.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            isRtl ? showNext() : showPrev()
          }}
          aria-label="Previous image"
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
          }}
        >
          <ChevronLeftIcon />
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(92vw, 1200px)',
          height: '85vh',
        }}
      >
        <Image
          src={allImages[lightboxIndex]}
          alt={`${title} view ${lightboxIndex + 1}`}
          fill
          sizes="100vw"
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>

      {allImages.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            isRtl ? showPrev() : showNext()
          }}
          aria-label="Next image"
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
          }}
        >
          <ChevronRightIcon />
        </button>
      )}

      {allImages.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#fff',
            fontSize: '14px',
            background: 'rgba(0,0,0,0.4)',
            padding: '4px 12px',
            borderRadius: '999px',
          }}
        >
          {lightboxIndex + 1} / {allImages.length}
        </div>
      )}
    </div>
  )

  // === CASE A: NO IMAGES AT ALL ===
  if (allImages.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          borderRadius: '12px',
          color: '#94a3b8',
          border: '1px dashed #cbd5e1',
          fontSize: '14px',
        }}
      >
        📦 No Media Assets Available
      </div>
    )
  }

  // === CASE B: EXACTLY ONE IMAGE (FALLBACK FLAT VIEW) ===
  if (allImages.length === 1) {
    return (
      <>
        <div
          onClick={() => openLightbox(0)}
          style={{
            width: '100%',
            height: '450px',
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'zoom-in',
          }}
        >
          <Image
            src={allImages[0]}
            alt={title}
            fill
            sizes="(max-width: 992px) 100vw, 60vw"
            priority
            style={{ objectFit: 'contain', padding: '1rem' }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: '12px',
              right: isRtl ? 'auto' : '12px',
              left: isRtl ? '12px' : 'auto',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              borderRadius: '6px',
              padding: '6px',
              display: 'flex',
            }}
          >
            <ExpandIcon />
          </span>
        </div>

        {lightbox}
      </>
    )
  }

  // === CASE C: MULTIPLE IMAGES (RENDER DETAILED EMBEDDED SLIDER CAROUSEL) ===
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <style>{`
          .embla { overflow: hidden; width: 100%; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
          .embla__container { display: flex; }
          .embla__slide { flex: 0 0 100%; min-width: 0; position: relative; height: 450px; display: flex; align-items: center; justify-content: center; cursor: zoom-in; }
          .embla-thumbs { overflow: hidden; margin-top: 0.5rem; }
          .embla-thumbs__container { display: flex; flex-direction: row; gap: 0.5rem; }
          .embla-thumbs__slide { flex: 0 0 80px; height: 80px; border-radius: 8px; border: 2px solid transparent; overflow: hidden; cursor: pointer; position: relative; background: #f8fafc; transition: border-color 0.2s ease; }
          .embla-thumbs__slide--selected { border-color: #3b82f6; }
          .embla-zoom-hint { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.5); color: #fff; border-radius: 6px; padding: 6px; display: flex; }
        `}</style>

        {/* Main Large Viewport Carousel */}
        <div className="embla" ref={emblaMainRef}>
          <div className="embla__container">
            {allImages.map((src, index) => (
              <div className="embla__slide" key={index} onClick={() => openLightbox(index)}>
                <Image
                  src={src}
                  alt={`${title} view ${index + 1}`}
                  fill
                  sizes="(max-width: 992px) 100vw, 60vw"
                  priority={index === 0}
                  style={{ objectFit: 'contain', padding: '1.5rem' }}
                />
                <span
                  className="embla-zoom-hint"
                  style={isRtl ? { right: 'auto', left: '12px' } : undefined}
                >
                  <ExpandIcon />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-thumbnail Navigation Strip */}
        <div className="embla-thumbs" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container">
            {allImages.map((src, index) => (
              <button
                key={index}
                onClick={() => onThumbClick(index)}
                type="button"
                className={`embla-thumbs__slide ${
                  index === selectedIndex ? 'embla-thumbs__slide--selected' : ''
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                <Image
                  src={src}
                  alt={`Thumbnail preview ${index + 1}`}
                  fill
                  sizes="80px"
                  style={{ objectFit: 'contain', padding: '4px' }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {lightbox}
    </>
  )
}
