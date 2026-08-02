'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import OrderButton from '../OrderButton'

interface ProductBuyActionsProps {
  product: any
  finalPrice: number
  iqdPrice: number
  currentLocale: string
  bodyFont?: string
  bodyColor?: string
}

export default function ProductBuyActions({
  product,
  finalPrice,
  iqdPrice,
  currentLocale,
  bodyFont,
  bodyColor,
}: ProductBuyActionsProps) {
  const pathname = usePathname()
  const [origin, setOrigin] = useState('')

  // Read window.location.origin AFTER hydration finishes
  useEffect(() => {
    // Use a microtask to avoid the cascading renders warning
    queueMicrotask(() => {
      setOrigin(window.location.origin)
    })
  }, [])

  const productUrl = origin ? `${origin}${pathname}` : pathname

  // Explicitly pass a locale ('en-US') so Server and Client format numbers identically
  const formattedIqd = iqdPrice.toLocaleString('en-US')
  const formattedUsd = finalPrice.toLocaleString('en-US')
  const displayPrice = `${formattedIqd} IQD (~$${formattedUsd})`

  return (
    <OrderButton
      currentLocale={currentLocale}
      product={{
        title: product.title,
        price: displayPrice,
        url: productUrl,
      }}
      bodyFont={bodyFont}
      bodyColor={bodyColor}
    />
  )
}
