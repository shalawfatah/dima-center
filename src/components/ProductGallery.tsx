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
      <div
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
      </div>
    )
  }

  // === CASE C: MULTIPLE IMAGES (RENDER DETAILED EMBEDDED SLIDER CAROUSEL) ===
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <style>{`
        .embla { overflow: hidden; width: 100%; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
        .embla__container { display: flex; }
        .embla__slide { flex: 0 0 100%; min-width: 0; position: relative; height: 450px; display: flex; align-items: center; justify-content: center; }
        .embla-thumbs { overflow: hidden; margin-top: 0.5rem; }
        .embla-thumbs__container { display: flex; flex-direction: row; gap: 0.5rem; }
        .embla-thumbs__slide { flex: 0 0 80px; height: 80px; border-radius: 8px; border: 2px solid transparent; overflow: hidden; cursor: pointer; position: relative; background: #f8fafc; transition: border-color 0.2s ease; }
        .embla-thumbs__slide--selected { border-color: #3b82f6; }
      `}</style>

      {/* Main Large Viewport Carousel */}
      <div className="embla" ref={emblaMainRef}>
        <div className="embla__container">
          {allImages.map((src, index) => (
            <div className="embla__slide" key={index}>
              <Image
                src={src}
                alt={`${title} view ${index + 1}`}
                fill
                sizes="(max-width: 992px) 100vw, 60vw"
                priority={index === 0}
                style={{ objectFit: 'contain', padding: '1.5rem' }}
              />
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
  )
}
