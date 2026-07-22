export const getDiscountedPrice = (product: any): number => {
  if (!product) return 0
  const originalPrice = Number(product.price) || 0
  if (!product.hasDiscount) return originalPrice

  if (product.discountType === 'fixed') {
    const discount = Number(product.discountValue) || 0
    return Math.max(0, originalPrice - discount)
  } else if (product.discountType === 'percentage') {
    const discountPercent = Number(product.discountValue) || 0
    return Math.max(0, originalPrice - (originalPrice * discountPercent) / 100)
  }
  return originalPrice
}

export function normalizeIraqiNumber(number: string): string {
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (!digits.startsWith('964')) digits = '964' + digits
  return digits
}

/**
 * Sums the discounted and original prices of every selected component,
 * accounting for per-slot quantity.
 */
export function calculateBuildTotals(selections: Record<string, any>) {
  const values = Object.values(selections)
  return {
    totalPrice: values.reduce(
      (sum, item: any) => sum + getDiscountedPrice(item) * (item.quantity || 1),
      0,
    ),
    totalOriginalPrice: values.reduce(
      (sum, item: any) => sum + (Number(item.price) || 0) * (item.quantity || 1),
      0,
    ),
  }
}
