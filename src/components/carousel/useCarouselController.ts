'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { EngineType } from 'embla-carousel'
import styles from '@/styles/product_carousel.module.css'

export function useCarouselController(isRtl: boolean) {
  const emblaDirection = isRtl ? 'rtl' : 'ltr'

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    duration: 20,
    dragFree: true,
    containScroll: 'trimSnaps',
    direction: emblaDirection,
  })

  // ─── Embla is an external store. Subscribe with useSyncExternalStore
  //     instead of mirroring its state into local useState. ─────────────
  const navState = useSyncExternalStore(
    useCallback(
      (onStoreChange: () => void) => {
        if (!emblaApi) return () => {}
        emblaApi.on('select', onStoreChange)
        emblaApi.on('reInit', onStoreChange)
        return () => {
          emblaApi.off('select', onStoreChange)
          emblaApi.off('reInit', onStoreChange)
        }
      },
      [emblaApi],
    ),
    useCallback(() => {
      if (!emblaApi) return '00'
      // Pack both booleans into a stable string so the snapshot has a
      // referential value React can compare cheaply.
      return `${emblaApi.canScrollPrev() ? 1 : 0}${emblaApi.canScrollNext() ? 1 : 0}`
    }, [emblaApi]),
    () => '00',
  )

  const canScrollPrev = navState[0] === '1'
  const canScrollNext = navState[1] === '1'

  // ─── Parallax scroll handler — external DOM mutation only. ──────────
  // No setState here, so no need to run it on mount.
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

      const parallaxFactor = 0.12
      let xTranslation = diffToTarget * (-1 * parallaxFactor * 100)
      xTranslation = Math.max(-10, Math.min(10, xTranslation))

      const imgLayer = slide.querySelector(`.${styles['product-parallax-img']}`) as HTMLElement
      if (imgLayer) {
        imgLayer.style.transform = `translateX(${xTranslation}%)`
      }
    })
  }, [])

  // Subscribe to scroll events only. No sync setState in the effect body.
  useEffect(() => {
    if (!emblaApi) return

    emblaApi.on('scroll', onScroll)
    emblaApi.on('reInit', onScroll)

    return () => {
      emblaApi.off('scroll', onScroll)
      emblaApi.off('reInit', onScroll)
    }
  }, [emblaApi, onScroll])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return { emblaRef, emblaDirection, canScrollPrev, canScrollNext, scrollPrev, scrollNext }
}
