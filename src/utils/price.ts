interface ProductPriceData {
  price: number
  hasDiscount?: boolean
  discountType?: 'fixed' | 'percentage'
  discountValue?: number
}

export function calculateProductPrice(product: ProductPriceData) {
  const originalPrice = product.price

  // If no discount is active, return the original price as final
  if (!product.hasDiscount || !product.discountValue || product.discountValue <= 0) {
    return {
      isDiscounted: false,
      originalPrice,
      finalPrice: originalPrice,
    }
  }

  let finalPrice = originalPrice

  if (product.discountType === 'percentage') {
    // Percentage discount math
    const discountAmount = (originalPrice * product.discountValue) / 100
    finalPrice = Math.max(0, originalPrice - discountAmount)
  } else {
    // Fixed numeric discount math
    finalPrice = Math.max(0, originalPrice - product.discountValue)
  }

  // Clean rounding down to 2 decimal points
  finalPrice = Math.round(finalPrice * 100) / 100

  return {
    isDiscounted: true,
    originalPrice,
    finalPrice,
    // Bonus helper to show badge elements (e.g., "-20%")
    badgeText:
      product.discountType === 'percentage'
        ? `-${product.discountValue}%`
        : `-$${product.discountValue}`,
  }
}
