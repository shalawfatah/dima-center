import dotenv from 'dotenv'
dotenv.config()

import { getPayload } from 'payload'
import config from '../payload.config'

interface ExternalCategory {
  _id: string
  name: string
}

interface ExternalItem {
  _id: string
  name: string
  barcode?: string
  price: number
  currency: string
  websitePrice?: number
  websitePriceCurrency?: string
  quantity?: number
  category?: string
  brand?: string
  description?: string
}

interface ExternalInventory {
  _id: string
  name: string
}

interface ExternalStock {
  _id: string
  name: string
  code?: string
  barcode?: string
  totalQuantity: number
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

// Bruska represents USD sometimes as "usd" and sometimes literally as the
// symbol "$". Normalize both currency fields down to a known code so we can
// reliably tell which of price / websitePrice is dollars vs dinar.
function normalizeCurrency(c?: string): 'usd' | 'iqd' | null {
  if (!c) return null
  const v = c.trim().toLowerCase()
  if (v === 'usd' || v === '$') return 'usd'
  if (v === 'iqd') return 'iqd'
  return null
}

// Items from /items carry two price fields: `price`/`currency` and
// `websitePrice`/`websitePriceCurrency`. In practice these are usually one
// USD value and one IQD value, but the currency isn't guaranteed to be
// pinned to a specific field, so we resolve both by inspecting the actual
// currency string on each side rather than assuming positions.
// If only one side is present, we derive the other using the branch's
// live exchange rate (from /items/ex_rate_change/:branchId) as a fallback.
function resolveDualPrices(
  item: ExternalItem,
  exRate: number | null,
): { priceUSD: number; priceIQD: number | undefined } {
  let priceUSD: number | undefined
  let priceIQD: number | undefined

  const cur1 = normalizeCurrency(item.currency)
  if (cur1 === 'usd') priceUSD = item.price
  if (cur1 === 'iqd') priceIQD = item.price

  const cur2 = normalizeCurrency(item.websitePriceCurrency)
  if (item.websitePrice !== undefined) {
    if (cur2 === 'usd') priceUSD = item.websitePrice
    if (cur2 === 'iqd') priceIQD = item.websitePrice
  }

  // Fallback: derive the missing side from the exchange rate if we have one
  if (priceUSD === undefined && priceIQD !== undefined && exRate) {
    priceUSD = priceIQD / exRate
  }
  if (priceIQD === undefined && priceUSD !== undefined && exRate) {
    priceIQD = priceUSD * exRate
  }

  return { priceUSD: priceUSD ?? item.price ?? 0, priceIQD }
}

export async function executeDifferentialSync() {
  const payload = await getPayload({ config })

  payload.logger.info(`🔗 Sync script connecting to database host...`)

  const BASE_URL = (process.env.BRUSK_BASE_URL || '').trim()
  const PREFIX = (process.env.BRUSK_CMS_PREFIX || '').trim()
  const API_KEY = (process.env.BRUSK_API_KEY || '').trim()
  const SECRET_KEY = (process.env.BRUSK_SECRET_KEY || '').trim()
  const BRANCH_ID = (process.env.BRUSK_BRANCH_ID || '').trim()

  if (!API_KEY || !SECRET_KEY || !BRANCH_ID) {
    throw new Error('Missing Bruska environment credentials.')
  }

  const requestHeaders = new Headers()
  requestHeaders.append('apikey', API_KEY)
  requestHeaders.append('secretkey', SECRET_KEY)

  // Cache buster timestamp
  const timestamp = Date.now()

  // =================================================================
  // 1. SYNC CATEGORIES (Cache Busted)
  // =================================================================
  payload.logger.info('⏳ Syncing categories...')
  const catRes = await fetch(
    `${BASE_URL}${PREFIX}/categories?branchId=${BRANCH_ID}&t=${timestamp}`,
    {
      method: 'GET',
      headers: requestHeaders,
      cache: 'no-store',
    },
  )

  if (!catRes.ok) throw new Error(`Bruska Category API error: Status ${catRes.status}`)

  const catData = await catRes.json()
  const externalCategories: ExternalCategory[] = catData.categories || []
  const categoryIdMap: Record<string, string | number> = {}

  for (const cat of externalCategories) {
    const computedSlug = slugify(cat.name || 'category')
    const existingCat = await payload.find({
      collection: 'categories',
      where: { slug: { equals: computedSlug } },
      limit: 1,
      locale: 'all',
    })

    let localCatId: string | number
    if (existingCat.docs.length > 0) {
      localCatId = existingCat.docs[0].id
      await payload.update({
        collection: 'categories',
        id: localCatId,
        data: { title: cat.name },
        req: { transactionID: null } as any,
      })
    } else {
      const newCat = await payload.create({
        collection: 'categories',
        data: { title: cat.name, slug: computedSlug },
        req: { transactionID: null } as any,
      })
      localCatId = newCat.id
    }
    categoryIdMap[cat._id] = localCatId
  }

  // =================================================================
  // 1b. FETCH REAL STOCK LEVELS (the /items endpoint's "quantity" field
  // is unreliable/often absent — actual stock lives in the Stocks system,
  // scoped by inventoryId. We fetch every inventory for this branch and
  // sum totalQuantity per barcode across all of them.)
  // =================================================================
  payload.logger.info('📦 Fetching inventories and real stock levels...')
  const stockByBarcode: Record<string, number> = {}

  try {
    const invRes = await fetch(
      `${BASE_URL}${PREFIX}/inventories?branchId=${BRANCH_ID}&t=${timestamp}`,
      { method: 'GET', headers: requestHeaders, cache: 'no-store' },
    )

    if (invRes.ok) {
      const invData = await invRes.json()
      const inventories: ExternalInventory[] = invData.inventories || []
      payload.logger.info(`Found ${inventories.length} inventories to pull stock from.`)

      for (const inv of inventories) {
        const stockUrl = `${BASE_URL}${PREFIX}/stocks?inventoryId=${inv._id}&branchId=${BRANCH_ID}&t=${timestamp}`
        payload.logger.info(`   -> requesting: ${stockUrl}`)
        const stockRes = await fetch(stockUrl, {
          method: 'GET',
          headers: requestHeaders,
          cache: 'no-store',
        })

        if (!stockRes.ok) {
          const bodyText = await stockRes.text().catch(() => '<unreadable>')
          payload.logger.info(
            `⚠️ Could not fetch stocks for inventory ${inv.name} (${inv._id}) — status ${stockRes.status}: ${bodyText}`,
          )
          continue
        }

        const stockData = await stockRes.json()
        const stocks: ExternalStock[] = stockData.stocks || []

        for (const s of stocks) {
          const barcode = (s.barcode || s.code || '').trim()
          if (!barcode) continue
          stockByBarcode[barcode] = (stockByBarcode[barcode] || 0) + (s.totalQuantity || 0)
        }
      }

      payload.logger.info(
        `Aggregated stock for ${Object.keys(stockByBarcode).length} distinct barcodes.`,
      )
    } else {
      payload.logger.info('⚠️ Could not fetch inventories — falling back to items[].quantity.')
    }
  } catch (stockErr) {
    console.error('⚠️ Stock fetch failed, falling back to items[].quantity:', stockErr)
  }

  // =================================================================
  // 1c. FETCH CURRENT EXCHANGE RATE (USD <-> IQD)
  // Used only as a fallback to derive a missing currency side when an
  // item is priced in just one of the two currencies.
  // =================================================================
  payload.logger.info('💱 Fetching current exchange rate...')
  let exRate: number | null = null
  try {
    const exRes = await fetch(
      `${BASE_URL}${PREFIX}/items/ex_rate_change/${BRANCH_ID}?t=${timestamp}`,
      { method: 'GET', headers: requestHeaders, cache: 'no-store' },
    )
    if (exRes.ok) {
      const exData = await exRes.json()
      exRate = typeof exData.exRate === 'number' ? exData.exRate : null
    } else {
      payload.logger.info(`⚠️ Could not fetch exchange rate — status ${exRes.status}`)
    }
  } catch (exErr) {
    console.error('⚠️ Exchange rate fetch failed:', exErr)
  }
  payload.logger.info(`Exchange rate (USD→IQD): ${exRate ?? 'unavailable'}`)

  // =================================================================
  // 2. FETCH & SYNC PRODUCTS (Cache Busted)
  // =================================================================
  payload.logger.info('📡 Fetching active Bruska catalog snapshot...')
  const itemRes = await fetch(`${BASE_URL}${PREFIX}/items?branchId=${BRANCH_ID}&t=${timestamp}`, {
    method: 'GET',
    headers: requestHeaders,
    cache: 'no-store',
  })

  if (!itemRes.ok) throw new Error('Failed to retrieve items from endpoint.')

  const itemData = await itemRes.json()
  const allItems: ExternalItem[] = itemData.items || []

  const items: ExternalItem[] = allItems

  const externalActiveIds = new Set<string>()
  let createCount = 0
  let updateCount = 0
  const errors: { item: string; message: string }[] = []

  for (const item of items) {
    externalActiveIds.add(item._id)
    try {
      // Match by external code ONLY. Matching on title as a fallback caused
      // false positives/negatives against localized title fields.
      const existingItem = await payload.find({
        collection: 'products',
        where: { code: { equals: item._id } },
        limit: 1,
        locale: 'all',
      })

      let linkedCategoryId = item.category ? categoryIdMap[item.category] : undefined
      if (!linkedCategoryId && Object.keys(categoryIdMap).length > 0) {
        linkedCategoryId = Object.values(categoryIdMap)[0]
      }

      const { priceUSD, priceIQD } = resolveDualPrices(item, exRate)

      const productPayloadData: any = {
        title: item.name,
        barcode: item.barcode || '',
        code: item._id,
        price: priceUSD,
        priceIQD: priceIQD,
        stock:
          (item.barcode && stockByBarcode[item.barcode.trim()] !== undefined
            ? stockByBarcode[item.barcode.trim()]
            : undefined) ??
          item.quantity ??
          0,
        description: item.description || '',
        brand: item.brand || '',
        condition: 'new' as const,
        category: linkedCategoryId,
        hasDiscount: false,
      }

      if (existingItem.docs.length > 0) {
        const current = existingItem.docs[0] as any

        const dbPrice = parseFloat(current.price) || 0
        const apiPrice = parseFloat(productPayloadData.price as any) || 0

        const dbPriceIQD = parseFloat(current.priceIQD) || 0
        const apiPriceIQD = parseFloat(productPayloadData.priceIQD as any) || 0

        const dbStock = parseInt(current.stock, 10) || 0
        const apiStock = parseInt(productPayloadData.stock as any, 10) || 0

        const needsCodeLinkUpdate = !current.code || current.code !== item._id

        if (
          dbPrice !== apiPrice ||
          dbPriceIQD !== apiPriceIQD ||
          dbStock !== apiStock ||
          needsCodeLinkUpdate
        ) {
          // Only touch price + priceIQD + stock on existing products. Title,
          // barcode, description, brand, category, etc. are left exactly as
          // they are in the DB — this update never overwrites them.
          const updateData: any = {
            price: productPayloadData.price,
            priceIQD: productPayloadData.priceIQD,
            stock: productPayloadData.stock,
          }
          if (needsCodeLinkUpdate) {
            updateData.code = item._id
          }

          payload.logger.info(
            `🔄 Updating price/stock only: ${item.name} (ID: ${current.id}) — ` +
              `USD ${dbPrice}→${apiPrice}, IQD ${dbPriceIQD}→${apiPriceIQD}, stock ${dbStock}→${apiStock}`,
          )
          await payload.update({
            collection: 'products',
            id: current.id,
            data: updateData,
            req: { transactionID: null } as any,
          })
          updateCount++
        }
      } else {
        payload.logger.info(`✨ Recreating / Creating clean item addition: ${item.name}`)
        await payload.create({
          collection: 'products',
          data: productPayloadData,
          req: { transactionID: null } as any,
        })
        createCount++
      }
    } catch (err: any) {
      console.error(`⚠️ Skip error on item ${item.name}:`, err)
      errors.push({ item: item.name, message: err?.message || String(err) })
    }
  }

  // =================================================================
  // 3. IDENTIFY & PURGE DELETED ITEMS
  // =================================================================
  payload.logger.info('🔍 Checking for products removed from Bruska...')

  const localProducts = await payload.find({
    collection: 'products',
    limit: 5000,
    locale: 'all',
  })

  let deleteCount = 0
  for (const prod of localProducts.docs as any[]) {
    if (prod.code && !externalActiveIds.has(prod.code)) {
      const logTitle = prod.title?.en || prod.title?.ckb || 'Unknown Item'
      payload.logger.info(`🗑️ Purging deleted catalog item: ${logTitle}`)
      await payload.delete({
        collection: 'products',
        id: prod.id,
        req: { transactionID: null } as any,
      })
      deleteCount++
    }
  }

  payload.logger.info(
    `🏁 Sync Complete. Created: ${createCount}, Updated: ${updateCount}, Purged: ${deleteCount}, Errors: ${errors.length}`,
  )
  return { created: createCount, updated: updateCount, deleted: deleteCount, errors }
}

if (process.argv[1]?.endsWith('importBruskCatalog.ts')) {
  executeDifferentialSync()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
