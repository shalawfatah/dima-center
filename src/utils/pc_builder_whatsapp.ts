import { getDiscountedPrice, normalizeIraqiNumber } from './pc_builder_pricing'

const SELLER_NUMBER = '9647701414269'

interface BuildOrderMessageArgs {
  buildName: string
  selections: Record<string, any>
  componentSlots: any[]
  totalPrice: number
  exchangeRate: number
  buyerNumber: string
  currentLocale: string
  getLocalizedTitle: (product: any) => string
  originUrl: string
}

export function buildWhatsAppOrderMessage({
  buildName,
  selections,
  componentSlots,
  totalPrice,
  exchangeRate,
  buyerNumber,
  currentLocale,
  getLocalizedTitle,
  originUrl,
}: BuildOrderMessageArgs): string {
  const specLines: string[] = []

  componentSlots.forEach((slot) => {
    const chosen = selections[slot.key]
    if (!chosen) return

    const qty = chosen.quantity || 1
    const unitPrice = getDiscountedPrice(chosen)
    const lineTotal = unitPrice * qty
    const itemTitle = getLocalizedTitle(chosen)
    const qtyPrefix = qty > 1 ? `(${qty}x) ` : ''
    specLines.push(`⚙️ *${slot.label}:* ${qtyPrefix}${itemTitle} ($${lineTotal.toLocaleString()})`)
  })

  const finalIqd = (totalPrice * exchangeRate).toLocaleString()
  const partsQuery = componentSlots
    .filter((s) => selections[s.key])
    .map((s) => `${s.key}:${selections[s.key].id}`)
    .join(',')

  return (
    `🖥️ *New PC Build Order Request: "${buildName}"*\n\n` +
    `*Selected Hardware Spec Breakdown:*\n` +
    `---------------------------------\n` +
    `${specLines.join('\n')}\n\n` +
    `---------------------------------\n` +
    `*Total Price (USD):* $${totalPrice.toLocaleString()}\n` +
    `*Total Price (IQD):* ${finalIqd} IQD\n` +
    `*Buyer Phone Number:* ${buyerNumber}\n\n` +
    `🔗 *Build Editor Sync Link:*\n` +
    `${originUrl}/${currentLocale}/pc-builder?parts=${partsQuery}`
  )
}

export function sendWhatsAppOrder(message: string) {
  const encodedMessage = encodeURIComponent(message)
  window.open(
    `https://wa.me/${normalizeIraqiNumber(SELLER_NUMBER)}?text=${encodedMessage}`,
    '_blank',
  )
}
