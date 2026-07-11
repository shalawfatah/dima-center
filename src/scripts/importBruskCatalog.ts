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
  quantity?: number
  category?: string
  brand?: string
  description?: string
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

export async function executeDifferentialSync() {
  const payload = await getPayload({ config })

  payload.logger.info(`🔗 Sync script connecting to database host...`)

  const BASE_URL = (process.env.BRUSK_BASE_URL || 'https://saaser.tadbeersoft.com').trim()
  const PREFIX = (process.env.BRUSK_CMS_PREFIX || '/api/public/cms').trim()
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
  const categoryIdMap: Record<string, string> = {}

  for (const cat of externalCategories) {
    const computedSlug = slugify(cat.name || 'category')
    const existingCat = await payload.find({
      collection: 'categories',
      where: { slug: { equals: computedSlug } },
      limit: 1,
      locale: 'all',
    })

    let localCatId: string
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
  const items: ExternalItem[] = itemData.items || []

  // 🚨 THE TRUTH DETECTOR LOG — keep this until price-freshness is confirmed, then remove
  const targetItem = items.find((i) => i.name?.toLowerCase().includes('t-force 2x16'))
  if (targetItem) {
    payload.logger.info(
      `🚨 [CRITICAL API CHECK] The raw network response from Bruska API for T-Force 2x16 contains:`,
    )
    payload.logger.info(`   -> Price: ${targetItem.price}`)
    payload.logger.info(`   -> _id:   ${targetItem._id}`)
  } else {
    payload.logger.info(
      `🚨 [CRITICAL API CHECK] Could not even find T-Force 2x16 in the raw incoming API array!`,
    )
  }

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

      const productPayloadData = {
        title: item.name,
        barcode: item.barcode || '',
        code: item._id,
        price: item.price || 0,
        stock: item.quantity !== undefined ? item.quantity : 0,
        description: item.description || '',
        brand: item.brand || '',
        condition: 'new' as const,
        category: linkedCategoryId,
        hasDiscount: false,
      }

      if (existingItem.docs.length > 0) {
        const current = existingItem.docs[0] as any

        const dbTitleCkb = String(current.title?.ckb || '').trim()
        const dbTitleEn = String(current.title?.en || current.title || '').trim()
        const apiTitle = String(productPayloadData.title || '').trim()

        const dbPrice = parseFloat(current.price) || 0
        const apiPrice = parseFloat(productPayloadData.price as any) || 0

        const dbStock = parseInt(current.stock, 10) || 0
        const apiStock = parseInt(productPayloadData.stock as any, 10) || 0

        const dbBarcode = String(current.barcode || '').trim()
        const apiBarcode = String(productPayloadData.barcode || '').trim()

        const needsCodeLinkUpdate = !current.code || current.code !== item._id

        if (
          (dbTitleCkb !== apiTitle && dbTitleEn !== apiTitle) ||
          dbPrice !== apiPrice ||
          dbStock !== apiStock ||
          dbBarcode !== apiBarcode ||
          needsCodeLinkUpdate
        ) {
          payload.logger.info(
            `🔄 Aligning and Updating record states: ${item.name} (ID: ${current.id})`,
          )
          await payload.update({
            collection: 'products',
            id: current.id,
            data: productPayloadData,
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
