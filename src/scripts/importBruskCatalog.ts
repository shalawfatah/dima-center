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

const DEFAULT_LOCALE = 'en'

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

  const timestamp = Date.now()

  // =================================================================
  // 1. FETCH REAL STOCK LEVELS
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
  // 2. SYNC CATEGORIES FIRST (Builds lookup maps for products)
  // =================================================================
  payload.logger.info('⏳ Syncing external categories...')
  const categoryIdMap = new Map<string, string | number>()
  let syncedCatCount = 0
  let createdCatCount = 0
  let updatedCatCount = 0
  let deletedCatCount = 0

  try {
    const catRes = await fetch(
      `${BASE_URL}${PREFIX}/categories?branchId=${BRANCH_ID}&t=${timestamp}`,
      {
        method: 'GET',
        headers: requestHeaders,
        cache: 'no-store',
      },
    )

    if (catRes.ok) {
      const catData = await catRes.json()
      const externalCategories: ExternalCategory[] = catData.categories || []
      const externalActiveSlugs = new Set<string>()

      for (const cat of externalCategories) {
        if (!cat.name) continue

        const targetSlug = slugify(cat.name)
        const finalSlug =
          targetSlug && targetSlug !== '-'
            ? targetSlug
            : `cat-${Buffer.from(cat.name).toString('hex').slice(0, 8)}`

        externalActiveSlugs.add(finalSlug)

        try {
          const existingCat = await payload.find({
            collection: 'categories',
            where: {
              slug: { equals: finalSlug },
            },
            limit: 1,
            locale: DEFAULT_LOCALE,
          })

          let payloadCatId: string | number

          if (existingCat.docs.length > 0) {
            const catDoc = existingCat.docs[0] as any
            payloadCatId = catDoc.id
            categoryIdMap.set(cat._id, payloadCatId)
            categoryIdMap.set(cat.name.toLowerCase(), payloadCatId)

            const existingTitleEn =
              typeof catDoc.title === 'object' ? catDoc.title?.en : catDoc.title

            if (existingTitleEn !== cat.name) {
              payload.logger.info(
                `📝 Updating title for category [slug: ${finalSlug}]: "${existingTitleEn}" ➔ "${cat.name}"`,
              )

              await payload.update({
                collection: 'categories',
                id: catDoc.id,
                data: {
                  title: cat.name,
                },
                context: {
                  skipSlugValidation: true,
                },
                locale: DEFAULT_LOCALE,
              })
              updatedCatCount++
            }
          } else {
            payload.logger.info(`✨ Creating new category [slug: ${finalSlug}]: "${cat.name}"`)
            const newCat = await payload.create({
              collection: 'categories',
              data: {
                title: cat.name,
                slug: finalSlug,
              },
              context: {
                skipSlugValidation: true,
              },
              locale: DEFAULT_LOCALE,
            })
            payloadCatId = newCat.id
            categoryIdMap.set(cat._id, payloadCatId)
            categoryIdMap.set(cat.name.toLowerCase(), payloadCatId)
            createdCatCount++
          }
          syncedCatCount++
        } catch (catErr: any) {
          console.error(`⚠️ Failed to sync category "${cat.name}":`, catErr?.message || catErr)
        }
      }

      payload.logger.info('🔍 Checking for categories removed from Bruska...')
      const localCategories = await payload.find({
        collection: 'categories',
        limit: 1000,
        locale: DEFAULT_LOCALE,
      })

      for (const localCat of localCategories.docs as any[]) {
        if (!localCat.slug || localCat.slug === 'uncategorized') continue

        if (!externalActiveSlugs.has(localCat.slug)) {
          const catTitle = typeof localCat.title === 'object' ? localCat.title?.en : localCat.title
          payload.logger.info(`🗑️ Purging removed category [slug: ${localCat.slug}]: "${catTitle}"`)

          await payload.delete({
            collection: 'categories',
            id: localCat.id,
          })
          deletedCatCount++
        }
      }
    }
  } catch (catSyncErr) {
    console.error('⚠️ Category sync section failed:', catSyncErr)
  }

  // Ensure fallback category exists
  let fallbackCategoryId: string | number
  const existingFallback = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'uncategorized' } },
    limit: 1,
    locale: DEFAULT_LOCALE,
  })

  if (existingFallback.docs.length > 0) {
    fallbackCategoryId = existingFallback.docs[0].id
  } else {
    const fallbackCat = await payload.create({
      collection: 'categories',
      data: {
        title: 'Uncategorized',
        slug: 'uncategorized',
      },
      context: {
        skipSlugValidation: true,
      },
      locale: DEFAULT_LOCALE,
    })
    fallbackCategoryId = fallbackCat.id
  }

  // =================================================================
  // 3. FETCH & SYNC PRODUCTS
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

  const externalActiveIds = new Set<string>()
  let createCount = 0
  let updateCount = 0
  const errors: { item: string; message: string }[] = []

  for (const item of allItems) {
    externalActiveIds.add(item._id)
    try {
      // Resolve category against the synced maps
      let resolvedCategory: number = Number(fallbackCategoryId)
      if (item.category) {
        const catKey = typeof item.category === 'string' ? item.category.toLowerCase() : ''
        const mappedId = categoryIdMap.get(catKey)
        if (mappedId !== undefined) {
          resolvedCategory = Number(mappedId)
        }
      }

      const existingItem = await payload.find({
        collection: 'products',
        where: { code: { equals: item._id } },
        limit: 1,
        locale: DEFAULT_LOCALE,
      })

      const calculatedStock =
        (item.barcode && stockByBarcode[item.barcode.trim()] !== undefined
          ? stockByBarcode[item.barcode.trim()]
          : undefined) ??
        item.quantity ??
        0

      if (existingItem.docs.length > 0) {
        const current = existingItem.docs[0] as any

        const dbPrice = parseFloat(current.price) || 0
        const apiPrice = parseFloat(item.price as any) || 0

        const dbStock = parseInt(current.stock, 10) || 0
        const apiStock = parseInt(calculatedStock as any, 10) || 0

        const dbCategory =
          typeof current.category === 'object' ? current.category?.id : current.category

        const needsCodeLinkUpdate = !current.code || current.code !== item._id
        const needsCategoryUpdate = dbCategory !== resolvedCategory

        if (
          dbPrice !== apiPrice ||
          dbStock !== apiStock ||
          needsCodeLinkUpdate ||
          needsCategoryUpdate
        ) {
          const currentTitle =
            typeof current.title === 'string' ? current.title : current.title?.en || item.name

          const safeSpecs = Array.isArray(current.technicalSpecs)
            ? current.technicalSpecs.map((spec: any) => ({
                key: spec.key || '',
                value: typeof spec.value === 'string' ? spec.value : spec.value?.en || '',
              }))
            : undefined

          const updateData: Record<string, any> = {
            title: currentTitle,
            price: apiPrice,
            stock: apiStock,
            category: resolvedCategory,
          }

          if (safeSpecs) {
            updateData.technicalSpecs = safeSpecs
          }

          if (needsCodeLinkUpdate) {
            updateData.code = item._id
          }

          payload.logger.info(`🔄 Updating item details: ${item.name} (ID: ${current.id})`)

          await payload.update({
            collection: 'products',
            id: current.id,
            data: updateData,
            locale: DEFAULT_LOCALE,
          })
          updateCount++
        }
      } else {
        payload.logger.info(`✨ Creating product: ${item.name}`)

        const productPayloadData = {
          title: item.name,
          description: item.description || '',
          barcode: item.barcode || '',
          code: item._id,
          price: item.price || 0,
          stock: calculatedStock,
          brand: item.brand || '',
          condition: 'new' as const,
          category: resolvedCategory,
          hasDiscount: false,
        }

        await payload.create({
          collection: 'products',
          data: productPayloadData,
          locale: DEFAULT_LOCALE,
        })
        createCount++
      }
    } catch (err: any) {
      console.error(`⚠️ Skip error on item ${item.name}:`, err)
      errors.push({ item: item.name, message: err?.message || String(err) })
    }
  }

  // =================================================================
  // 4. PURGE DELETED PRODUCTS
  // =================================================================
  payload.logger.info('🔍 Checking for products removed from Bruska...')

  const localProducts = await payload.find({
    collection: 'products',
    limit: 5000,
    locale: DEFAULT_LOCALE,
  })

  let deleteCount = 0
  for (const prod of localProducts.docs as any[]) {
    if (prod.code && !externalActiveIds.has(prod.code)) {
      const logTitle =
        typeof prod.title === 'string'
          ? prod.title
          : prod.title?.en || prod.title?.ckb || 'Unknown Item'
      payload.logger.info(`🗑️ Purging deleted catalog item: ${logTitle}`)
      await payload.delete({
        collection: 'products',
        id: prod.id,
      })
      deleteCount++
    }
  }

  payload.logger.info(
    `🏁 Sync Complete. Products Created: ${createCount}, Updated: ${updateCount}, Purged: ${deleteCount}, Categories Synced: ${syncedCatCount}, Errors: ${errors.length}`,
  )
  return {
    created: createCount,
    updated: updateCount,
    deleted: deleteCount,
    categoriesSynced: syncedCatCount,
    errors,
  }
}

if (process.argv[1]?.endsWith('importBruskCatalog.ts')) {
  executeDifferentialSync()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
