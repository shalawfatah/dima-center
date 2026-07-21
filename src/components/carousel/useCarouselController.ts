'use client'

import { useCallback, useEffect, useState } from 'react'
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

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback((api: any) => {
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

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

  useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    onScroll(emblaApi)

    emblaApi.on('select', onSelect)
    emblaApi.on('scroll', onScroll)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('reInit', onScroll)
  }, [emblaApi, onSelect, onScroll])

  return { emblaRef, emblaDirection, canScrollPrev, canScrollNext, scrollPrev, scrollNext }
}
