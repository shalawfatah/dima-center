// src/utils/pc_builder_bundle.ts

import { COMPONENT_SLOTS } from '@/utils/pc_build_items'

export const BUNDLE_REQUIRED_SLOTS = COMPONENT_SLOTS.map((s) => s.key).filter((k) => k !== 'cooler')

export type Selections = Record<string, any>
export type BundlePrices = Record<string, number>

export function isBuildComplete(selections: Selections): boolean {
  return BUNDLE_REQUIRED_SLOTS.every((key) => selections[key] != null)
}

export async function fetchBundlePrices(
  selections: Selections,
  signal?: AbortSignal,
): Promise<BundlePrices> {
  const items = Object.entries(selections)
    .map(([slotKey, item]: [string, any]) => ({
      slotKey,
      barcode: item?.barcode,
      quantity: item?.quantity || 1,
      rawPrice: item?.price,
    }))
    .filter((x) => typeof x.barcode === 'string' && x.barcode.length > 0)

  console.log('[bundle] → request items:', items)

  if (items.length === 0) return {}

  const res = await fetch('/api/pc-builder/bundle-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map(({ barcode, quantity }) => ({ barcode, quantity })),
    }),
    signal,
  })

  console.log('[bundle] ← route status:', res.status)

  if (!res.ok) {
    const errText = await res.clone().text()
    console.error('[bundle] route error body:', errText.slice(0, 500))
    throw new Error(`Bundle price fetch failed: ${res.status}`)
  }

  const data = await res.json()
  const apiItems: any[] = data?.record?.items ?? []

  console.log(
    '[bundle] ← upstream items:',
    apiItems.map((it) => ({
      barcode: it.barcode,
      name: it.name,
      sellingPriceDollar: it.sellingPriceDollar,
      sellingPriceMultipleDollar: it.sellingPriceMultipleDollar,
      hasBundleField: 'sellingPriceMultipleDollar' in it,
      bundleFieldType: typeof it.sellingPriceMultipleDollar,
    })),
  )

  const byBarcode = new Map<string, any>()
  for (const it of apiItems) {
    if (it?.barcode) byBarcode.set(String(it.barcode), it)
  }

  const prices: BundlePrices = {}
  for (const { slotKey, barcode } of items) {
    const match = byBarcode.get(String(barcode))
    const bundlePrice = Number(match?.sellingPriceMultipleDollar)
    const willUse = Number.isFinite(bundlePrice) && bundlePrice > 0
    console.log(`[bundle] slot=${slotKey} barcode=${barcode}`, {
      matched: !!match,
      rawBundleValue: match?.sellingPriceMultipleDollar,
      parsedBundlePrice: bundlePrice,
      willUse,
    })
    if (willUse) prices[slotKey] = bundlePrice
  }

  console.log('[bundle] → final bundlePrices map:', prices)
  return prices
}
