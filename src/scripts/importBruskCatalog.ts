import dotenv from 'dotenv'
dotenv.config()

import { getPayload } from 'payload'
import config from '../payload.config'
import { getBruskConfig } from '@/utils/brusk_api/brusk_client'
import { fetchStockByBarcode } from '@/utils/brusk_api/brusk_stock'
import { syncCategories } from '@/utils/brusk_api/brusk_categories'
import { syncProducts } from '@/utils/brusk_api/brusk_products'

export async function executeDifferentialSync() {
  const payload = await getPayload({ config })
  payload.logger.info(`🔗 Sync script connecting to database host...`)

  const { baseUrl, prefix, branchId, requestHeaders } = getBruskConfig()

  // 1. Fetch real stock levels
  payload.logger.info('📦 Fetching inventories and real stock levels...')
  const stockByBarcode = await fetchStockByBarcode(
    baseUrl,
    prefix,
    branchId,
    requestHeaders,
    payload.logger,
  )

  // 2. Sync Categories
  payload.logger.info('⏳ Syncing external categories...')
  const { categoryIdMap, fallbackCategoryId, syncedCatCount } = await syncCategories(
    payload,
    baseUrl,
    prefix,
    branchId,
    requestHeaders,
  )

  // 3 & 4. Fetch, Sync, & Purge Products
  const { createdIds, updatedIds, deletedIds, errors } = await syncProducts(
    payload,
    baseUrl,
    prefix,
    branchId,
    requestHeaders,
    categoryIdMap,
    fallbackCategoryId,
    stockByBarcode,
  )

  payload.logger.info(
    `🏁 Sync Complete. Products Created: ${createdIds.length}, Updated: ${updatedIds.length}, Purged: ${deletedIds.length}, Categories Synced: ${syncedCatCount}, Errors: ${errors.length}`,
  )

  return {
    success: true,
    created: createdIds.length,
    updated: updatedIds.length,
    deleted: deletedIds.length,
    categoriesSynced: syncedCatCount,
    createdIds,
    updatedIds,
    deletedIds,
    errors,
  }
}

if (process.argv[1]?.endsWith('importBruskCatalog.ts')) {
  executeDifferentialSync()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2))
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
