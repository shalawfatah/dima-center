'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ExtendedProductCarouselProps, ProductItem } from '@/types/types'
import styles from '@/styles/product_carousel.module.css'
import { carouselDictionary } from '@/utils/carousel_dictionary'
import { resolveImageUrl } from '@/utils/resolve_image_url'
import {
  getDiscountedPrice,
  getFallbackText,
  sortProductsForDisplay,
} from '@/utils/product_helpers'
import NextBtn from './carousel/NextBtn'
import PrevBtn from './carousel/PrevBtn'
import ProductCard from './carousel/ProductCard'
import QuickViewModal from './carousel/QuickViewModal'
import { useCarouselController } from './carousel/useCarouselController'

export default function ProductCarousel({
  products,
  currentLocale,
  isRtl,
  onAddToCart,
  linkResolver,
  cardWidth = 220,
  cardHeight = 300,
}: ExtendedProductCarouselProps) {
  const { emblaRef, emblaDirection, canScrollPrev, canScrollNext, scrollPrev, scrollNext } =
    useCarouselController(isRtl)

  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null)
  const [toastProduct, setToastProduct] = useState<ProductItem | null>(null)

  useEffect(() => {
    if (!toastProduct) return
    const timer = setTimeout(() => setToastProduct(null), 4000)
    return () => clearTimeout(timer)
  }, [toastProduct])

  const sortedProducts = useMemo(() => sortProductsForDisplay(products), [products])

  const getProductPath = useCallback(
    (
      product: ProductItem & { linkType?: string; staticUrl?: string; linkedProduct?: any },
    ): string => {
      // 1. Respect top-level custom linkResolver if provided
      if (linkResolver) return linkResolver(product)

      // 2. Handle UIProducts flexible link settings (Static / Direct CRM Product link)
      if (product.linkType === 'static' && product.staticUrl) {
        return product.staticUrl
      }

      if (product.linkType === 'product' && product.linkedProduct) {
        const linked = typeof product.linkedProduct === 'object' ? product.linkedProduct : null
        if (linked) {
          const linkedCatSlug =
            typeof linked.category === 'object' && linked.category?.slug
              ? linked.category.slug
              : 'products'
          return `/${currentLocale}/${linkedCatSlug}/${linked.id}`
        }
      }

      // 3. Special Case Offers routing using ID
      if (product.isCaseOffer) {
        return `/${currentLocale}/case-offers/${product.id}`
      }

      // 4. Resolve Category Slug (handles both category & uiCategory relationships)
      let categorySlug = 'products'

      if (typeof product.category === 'object' && product.category?.slug) {
        categorySlug = product.category.slug
      } else if (typeof product.uiCategory === 'object' && product.uiCategory?.slug) {
        categorySlug = product.uiCategory.slug
      }

      // 5. Build dynamic /[locale]/[category_slug]/[id] route
      return `/${currentLocale}/${categorySlug}/${product.id}`
    },
    [currentLocale, linkResolver],
  )

  const handleAddToCart = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault()
    if (onAddToCart) {
      onAddToCart(product)
      return
    }

    try {
      const storedCart = localStorage.getItem('cart')
      const cart = storedCart ? JSON.parse(storedCart) : []
      const finalPrice = getDiscountedPrice(product)
      const existingIndex = cart.findIndex((item: any) => item.id === product.id)

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1
      } else {
        cart.push({
          id: product.id,
          title: getFallbackText(product, 'title', currentLocale),
          price: finalPrice,
          quantity: 1,
          imageUrl: resolveImageUrl(product),
        })
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))
      setToastProduct(product)
    } catch (err) {
      console.error('Localstorage execution error:', err)
    }
  }

  const activeLocale = (
    carouselDictionary[currentLocale as 'en' | 'ar' | 'ckb'] ? currentLocale : 'en'
  ) as 'en' | 'ar' | 'ckb'
  const t = carouselDictionary[activeLocale]

  return (
    <div
      className={styles['pc-wrapper']}
      data-dir={emblaDirection}
      style={
        { '--pc-title-font': isRtl ? '"Rudaw", sans-serif' : 'inherit' } as React.CSSProperties
      }
    >
      {canScrollPrev && <PrevBtn isRtl={isRtl} scrollPrev={scrollPrev} />}
      {canScrollNext && <NextBtn isRtl={isRtl} scrollNext={scrollNext} />}

      <div ref={emblaRef} className={styles['pc-viewport']}>
        <div className={styles['product-carousel-track']}>
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currentLocale={currentLocale}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              productPath={getProductPath(product)}
              t={t}
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          currentLocale={currentLocale}
          t={t}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}
