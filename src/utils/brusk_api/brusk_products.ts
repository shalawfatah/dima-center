import { ExternalItem } from '@/types/brusk_types'

const DEFAULT_LOCALE = 'en'

export async function syncProducts(
  payload: any,
  baseUrl: string,
  prefix: string,
  branchId: string,
  requestHeaders: Headers,
  categoryIdMap: Map<string, string | number>,
  fallbackCategoryId: string | number,
  stockByBarcode: Record<string, number>,
) {
  const timestamp = Date.now()

  payload.logger.info('📡 Fetching active Bruska catalog snapshot...')
  const itemRes = await fetch(`${baseUrl}${prefix}/items?branchId=${branchId}&t=${timestamp}`, {
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
          price: Number(item.price) || 0,
          stock: Number(calculatedStock) || 0,
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
      const errorDetails = err?.data?.errors
        ? JSON.stringify(err.data.errors)
        : err?.message || String(err)

      // Forces the exact database error straight into your production logs
      payload.logger.error(
        `❌ CRITICAL CREATE/UPDATE ERROR for item "${item.name}" (ID: ${item._id}): ${errorDetails}`,
      )

      errors.push({ item: item.name, message: errorDetails })
    }
  }

  // Purge deleted products
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

  return { createCount, updateCount, deleteCount, errors }
}
