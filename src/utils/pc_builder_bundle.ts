// src/utils/pc_builder_bundle.ts

import { COMPONENT_SLOTS } from '@/utils/pc_build_items'

/**
 * Slots that must ALL be filled for bundle pricing to kick in.
 * `cooler` is intentionally excluded — the client considers it optional,
 * so a build missing only the cooler still qualifies for bundle pricing.
 */
export const BUNDLE_REQUIRED_SLOTS = COMPONENT_SLOTS.map((s) => s.key).filter((k) => k !== 'cooler') // → ['cpu','gpu','motherboard','ram','m-2','psu','case']

export type Selections = Record<string, any>
export type BundlePrices = Record<string, number>

/** True when every required slot has a chosen component. */
export function isBuildComplete(selections: Selections): boolean {
  return BUNDLE_REQUIRED_SLOTS.every((key) => selections[key] != null)
}

/**
 * Calls our own Next.js API route (which in turn calls Tadbeer's
 * availability-items endpoint with server-side credentials).
 * Returns a map of { slotKey -> sellingPriceMultipleDollar } for whichever
 * slots the upstream returned a bundle price for.
 */
export async function fetchBundlePrices(
  selections: Selections,
  signal?: AbortSignal,
): Promise<BundlePrices> {
  const items = Object.entries(selections)
    .map(([slotKey, item]: [string, any]) => ({
      slotKey,
      barcode: item?.barcode,
      quantity: item?.quantity || 1,
    }))
    // skip anything malformed — a missing barcode would 400 the whole request
    .filter((x) => typeof x.barcode === 'string' && x.barcode.length > 0)

  if (items.length === 0) return {}

  const res = await fetch('/api/pc-builder/bundle-prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map(({ barcode, quantity }) => ({ barcode, quantity })),
    }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`Bundle price fetch failed: ${res.status}`)
  }

  const data = await res.json()
  const apiItems: any[] = data?.record?.items ?? []

  // Map by barcode back to slot keys
  const byBarcode = new Map<string, any>()
  for (const it of apiItems) {
    if (it?.barcode) byBarcode.set(String(it.barcode), it)
  }

  const prices: BundlePrices = {}
  for (const { slotKey, barcode } of items) {
    const match = byBarcode.get(String(barcode))
    const bundlePrice = Number(match?.sellingPriceMultipleDollar)
    if (Number.isFinite(bundlePrice) && bundlePrice > 0) {
      prices[slotKey] = bundlePrice
    }
  }
  return prices
}
