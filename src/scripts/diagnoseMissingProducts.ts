import dotenv from 'dotenv'
dotenv.config()
import { getPayload } from 'payload'
import config from '../payload.config'
import { getBruskConfig } from '@/utils/brusk_api/brusk_client'
import { ExternalItem } from '@/types/brusk_types'

const DEFAULT_LOCALE = 'en'

/**
 * Fetches the full item list from Bruska. Confirmed (from prior sync logs)
 * that this endpoint ignores page/limit and always returns everything, so
 * this is a single plain fetch — no pagination loop needed.
 */
async function fetchAllBruskaItems(
  baseUrl: string,
  prefix: string,
  branchId: string,
  requestHeaders: Headers,
): Promise<ExternalItem[]> {
  const timestamp = Date.now()
  const itemRes = await fetch(`${baseUrl}${prefix}/items?branchId=${branchId}&t=${timestamp}`, {
    method: 'GET',
    headers: requestHeaders,
    cache: 'no-store',
  })

  if (!itemRes.ok) throw new Error('Failed to retrieve items from endpoint.')

  const itemData = await itemRes.json()
  return itemData.items || []
}

/**
 * Fetches every existing product's `code` field, in batches, so we can build
 * a full Set without assuming a max limit on payload.find.
 */
async function fetchAllExistingCodes(payload: any): Promise<Set<string>> {
  const codes = new Set<string>()
  let page = 1
  const limit = 500

  while (true) {
    const result = await payload.find({
      collection: 'products',
      limit,
      page,
      locale: DEFAULT_LOCALE,
      depth: 0,
      select: { code: true },
    })

    for (const doc of result.docs as any[]) {
      if (doc.code) codes.add(doc.code)
    }

    if (!result.hasNextPage) break
    page++
  }

  return codes
}

export async function diagnoseMissingProducts() {
  const payload = await getPayload({ config })
  const { baseUrl, prefix, branchId, requestHeaders } = getBruskConfig()

  payload.logger.info('📡 Fetching Bruska catalog...')
  const allItems = await fetchAllBruskaItems(baseUrl, prefix, branchId, requestHeaders)
  payload.logger.info(`📊 Bruska reports ${allItems.length} items`)

  payload.logger.info('📚 Fetching all existing product codes...')
  const existingCodes = await fetchAllExistingCodes(payload)
  payload.logger.info(`📚 Found ${existingCodes.size} existing product codes in DB`)

  // Items from Bruska with no matching product.code — these are the ones
  // that SHOULD go through the create path in syncProducts.
  const missingItems = allItems.filter((item) => !existingCodes.has(item._id))

  payload.logger.info(
    `🔎 ${missingItems.length} Bruska item(s) have no matching product.code (would attempt CREATE)`,
  )

  if (missingItems.length === 0) {
    payload.logger.info('✅ Every Bruska item already has a matching product. Nothing to diagnose.')
    return { totalItems: allItems.length, existingCodes: existingCodes.size, missing: [] }
  }

  // Also check for the inverse: products in the DB with a code that no
  // longer exists in Bruska (these should get purged by syncProducts).
  const bruskaIds = new Set(allItems.map((i) => i._id))
  const staleCodes = Array.from(existingCodes).filter((code) => !bruskaIds.has(code))
  if (staleCodes.length > 0) {
    payload.logger.info(
      `🗑️ ${staleCodes.length} product code(s) in DB no longer exist in Bruska (would be purged)`,
    )
  }

  const report: {
    id: string
    name: string
    wouldCreate: boolean
    reason?: string
    missingFields: string[]
  }[] = []

  for (const item of missingItems) {
    const missingFields: string[] = []

    // Mirror the exact required/likely-required fields your syncProducts
    // create payload relies on, so we can flag bad source data up front.
    if (!item.name) missingFields.push('name (required for title)')
    if (!item._id) missingFields.push('_id (required for code)')
    if (item.price === undefined || item.price === null) missingFields.push('price')

    let wouldCreate = true
    let reason: string | undefined

    if (missingFields.length > 0) {
      wouldCreate = false
      reason = `Missing/invalid source fields: ${missingFields.join(', ')}`
    } else {
      // Dry-run the actual create call against Payload's validation so we
      // catch collection-level errors (required fields, hooks, access
      // control, unique constraints, etc.) without guessing.
      try {
        const created = await payload.create({
          collection: 'products',
          data: {
            title: item.name,
            description: item.description || '',
            barcode: item.barcode || '',
            code: item._id,
            price: Number(item.price) || 0,
            stock: Number(item.quantity) || 0,
            brand: item.brand || '',
            condition: 'new' as const,
            hasDiscount: false,
          },
          locale: DEFAULT_LOCALE,
          // Roll it back immediately — this script is diagnostic only.
        })

        // Immediately delete what we just created since this is a dry run.
        await payload.delete({ collection: 'products', id: created.id })
      } catch (err: any) {
        wouldCreate = false
        reason = err?.data?.errors ? JSON.stringify(err.data.errors) : err?.message || String(err)
      }
    }

    report.push({
      id: item._id,
      name: item.name || '(no name)',
      wouldCreate,
      reason,
      missingFields,
    })

    if (wouldCreate) {
      payload.logger.info(`✅ Would create fine: "${item.name}" (${item._id})`)
    } else {
      payload.logger.error(`❌ Would FAIL to create: "${item.name}" (${item._id}) — ${reason}`)
    }
  }

  const failing = report.filter((r) => !r.wouldCreate)
  payload.logger.info(
    `🏁 Diagnosis complete. ${missingItems.length - failing.length}/${missingItems.length} missing items would create successfully. ${failing.length} would fail.`,
  )

  return {
    totalItems: allItems.length,
    existingCodes: existingCodes.size,
    missingCount: missingItems.length,
    failingCount: failing.length,
    staleCodesCount: staleCodes.length,
    report,
  }
}

if (process.argv[1]?.endsWith('diagnoseMissingProducts.ts')) {
  diagnoseMissingProducts()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
