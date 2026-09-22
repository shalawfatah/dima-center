// src/utils/pc_builder_pricing.ts

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
 *
 * When `bundlePrices` is provided and a slot has an entry, that bundle
 * price is used instead of the normal (possibly discounted) price for that
 * line. Slots without a bundle entry fall back to normal pricing — this is
 * what lets an optional `cooler` still contribute even when the rest of
 * the build is on bundle pricing.
 */
export function calculateBuildTotals(
  selections: Record<string, any>,
  bundlePrices?: Record<string, number>,
) {
  const entries = Object.entries(selections)
  const priceFor = (slotKey: string, item: any): number => {
    const bundle = bundlePrices?.[slotKey]
    if (Number.isFinite(bundle) && (bundle as number) > 0) {
      return bundle as number
    }
    return getDiscountedPrice(item)
  }

  return {
    totalPrice: entries.reduce(
      (sum, [slotKey, item]) => sum + priceFor(slotKey, item) * (item.quantity || 1),
      0,
    ),
    totalOriginalPrice: entries.reduce(
      (sum, [, item]) => sum + (Number(item.price) || 0) * (item.quantity || 1),
      0,
    ),
  }
}
