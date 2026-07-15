'use client'

import { usePathname } from 'next/navigation'
import OrderButton from '../OrderButton'

interface ProductBuyActionsProps {
  product: any
  finalPrice: number
  iqdPrice: number
  currentLocale: string
}

export default function ProductBuyActions({
  product,
  finalPrice,
  iqdPrice,
  currentLocale,
}: ProductBuyActionsProps) {
  // 1. Get the exact path (e.g., "/ckb/products/4339")
  const pathname = usePathname()

  // 2. Build the full link dynamically
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const productUrl = `${origin}${pathname}`

  // 3. Format prices
  const formattedIqd = iqdPrice.toLocaleString()
  const formattedUsd = finalPrice.toLocaleString()
  const displayPrice = `${formattedIqd} IQD (~$${formattedUsd})`

  return (
    <OrderButton
      currentLocale={currentLocale}
      product={{
        title: product.title,
        price: displayPrice,
        url: productUrl,
      }}
    />
  )
}
