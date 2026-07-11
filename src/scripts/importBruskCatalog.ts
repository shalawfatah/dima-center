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

// Helper to generate URL-safe slugs from category names
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

async function runImport() {
  console.log('Initializing Payload context...')
  const payload = await getPayload({ config })

  const BASE_URL = (process.env.BRUSK_BASE_URL || 'https://saaser.tadbeersoft.com').trim()
  const PREFIX = (process.env.BRUSK_CMS_PREFIX || '/api/public/cms').trim()
  const API_KEY = (process.env.BRUSK_API_KEY || '').trim()
  const SECRET_KEY = (process.env.BRUSK_SECRET_KEY || '').trim()
  const BRANCH_ID = (process.env.BRUSK_BRANCH_ID || '').trim()

  if (!API_KEY || !SECRET_KEY || !BRANCH_ID) {
    throw new Error('Missing credentials. Please check your .env file layout.')
  }

  const requestHeaders = new Headers()
  requestHeaders.append('apikey', API_KEY)
  requestHeaders.append('secretkey', SECRET_KEY)

  try {
    // =================================================================
    // STAGE 1: FETCH & SYNC CATEGORIES
    // =================================================================
    payload.logger.info('🚀 Fetching categories from Bruska API...')
    const catRes = await fetch(`${BASE_URL}${PREFIX}/categories?branchId=${BRANCH_ID}`, {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'follow',
    })

    if (!catRes.ok) {
      throw new Error(`Bruska Category API error: Status ${catRes.status} - ${await catRes.text()}`)
    }

    const catData = await catRes.json()
    const externalCategories: ExternalCategory[] = catData.categories || []
    payload.logger.info(`Found ${externalCategories.length} categories to sync.`)

    // Map to keep track of Bruska_ID -> Payload_ID for the item loop below
    const categoryIdMap: Record<string, string> = {}

    for (const cat of externalCategories) {
      const computedSlug = slugify(cat.name || 'category')

      // Check if category already exists matching the generated unique slug
      const existingCat = await payload.find({
        collection: 'categories',
        where: { slug: { equals: computedSlug } },
        limit: 1,
      })

      let localCatId: string

      if (existingCat.docs.length > 0) {
        localCatId = existingCat.docs[0].id
        payload.logger.info(`Category exists, mapping: ${cat.name}`)
        // Optionally update title if changed
        await payload.update({
          collection: 'categories',
          id: localCatId,
          data: { title: cat.name },
          req: { transactionID: null } as any,
        })
      } else {
        payload.logger.info(`Creating missing category: ${cat.name}`)
        const newCat = await payload.create({
          collection: 'categories',
          data: {
            title: cat.name,
            slug: computedSlug,
          },
          req: { transactionID: null } as any,
        })
        localCatId = newCat.id
      }

      // Cache the internal DB ID under the external Bruska string identifier
      categoryIdMap[cat._id] = localCatId
    }

    // =================================================================
    // STAGE 2: FETCH & SYNC PRODUCTS (ITEMS)
    // =================================================================
    payload.logger.info('🚀 Fetching items from Bruska API...')
    const itemRes = await fetch(`${BASE_URL}${PREFIX}/items?branchId=${BRANCH_ID}`, {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'follow',
    })

    if (!itemRes.ok) {
      throw new Error(`Bruska Items API error: Status ${itemRes.status} - ${await itemRes.text()}`)
    }

    const itemData = await itemRes.json()
    const items: ExternalItem[] = itemData.items || []
    payload.logger.info(`Found ${items.length} items to process. Syncing into database rows...`)

    let successCount = 0

    for (const item of items) {
      try {
        const existingItem = await payload.find({
          collection: 'products',
          where: {
            or: [
              { code: { equals: item._id } },
              ...(item.barcode ? [{ barcode: { equals: item.barcode } }] : []),
            ],
          },
          limit: 1,
        })

        // Determine correct relation linkage from our Stage 1 cache dictionary
        let linkedCategoryId = item.category ? categoryIdMap[item.category] : undefined

        // Fallback safety layer: if item references a category string missing from map,
        // use the very first available mapped category so database constraint doesn't reject it
        if (!linkedCategoryId && Object.keys(categoryIdMap).length > 0) {
          linkedCategoryId = Object.values(categoryIdMap)[0]
        }

        const productPayloadData: any = {
          title: item.name,
          barcode: item.barcode || '',
          code: item._id,
          price: item.price || 0,
          stock: item.quantity !== undefined ? item.quantity : 0,
          description: item.description || '',
          brand: item.brand || '',
          condition: 'new',
          category: linkedCategoryId, // Dynamic mapping working seamlessly
          hasDiscount: false,
        }

        if (existingItem.docs.length > 0) {
          payload.logger.info(`Updating product: ${item.name}`)
          await payload.update({
            collection: 'products',
            id: existingItem.docs[0].id,
            data: productPayloadData,
            req: { transactionID: null } as any,
          })
        } else {
          payload.logger.info(`Creating product: ${item.name}`)
          await payload.create({
            collection: 'products',
            data: productPayloadData,
            req: { transactionID: null } as any,
          })
        }

        successCount++
      } catch (rowError) {
        console.error(`⚠️ Failed to sync item "${item.name}":`, rowError)
      }
    }

    payload.logger.info(
      `🎉 Completed! Successfully synchronized ${successCount}/${items.length} products with accurate relational categories.`,
    )
    process.exit(0)
  } catch (error) {
    console.error('Fatal execution error during data sync:', error)
    process.exit(1)
  }
}

runImport()
