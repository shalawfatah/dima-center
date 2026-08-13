import { ExternalItem } from '@/types/brusk_types'

const DEFAULT_LOCALE = 'en'

async function fetchAllItems(
  payload: any,
  baseUrl: string,
  prefix: string,
  branchId: string,
  requestHeaders: Headers,
): Promise<ExternalItem[]> {
  const timestamp = Date.now()
  const allItems: ExternalItem[] = []

  let page = 1
  const pageSize = 100
  let previousPageIds: string | null = null

  while (true) {
    const url = `${baseUrl}${prefix}/items?branchId=${branchId}&t=${timestamp}&page=${page}&limit=${pageSize}`
    const itemRes = await fetch(url, {
      method: 'GET',
      headers: requestHeaders,
      cache: 'no-store',
    })

    if (!itemRes.ok) throw new Error(`Failed to retrieve items from endpoint (page ${page}).`)

    const itemData = await itemRes.json()
    const pageItems: ExternalItem[] = itemData.items || []

    payload.logger.info(`📄 Fetched page ${page}: ${pageItems.length} items`)

    const currentPageIds = pageItems
      .map((i) => i._id)
      .sort()
      .join(',')

    if (page === 1) {
      allItems.push(...pageItems)
    } else if (currentPageIds === previousPageIds) {
      payload.logger.info(
        `🛑 Page ${page} is identical to page ${page - 1} — API does not appear to paginate. Stopping.`,
      )
      break
    } else {
      allItems.push(...pageItems)
    }

    previousPageIds = currentPageIds

    const hasMoreFlag =
      itemData.hasMore ?? itemData.hasNextPage ?? itemData.pagination?.hasMore ?? undefined

    if (hasMoreFlag !== undefined) {
      if (!hasMoreFlag) break
    } else if (pageItems.length < pageSize) {
      break
    } else if (pageItems.length === 0) {
      break
    }

    if (page > 200) {
      payload.logger.warn('⚠️ Stopped pagination after 200 pages — check API response shape.')
      break
    }

    page++
  }

  const deduped = Array.from(new Map(allItems.map((i) => [i._id, i])).values())

  payload.logger.info(
    `📊 Total items fetched from Bruska: ${allItems.length} (${deduped.length} unique)`,
  )

  return deduped
}

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
  payload.logger.info('📡 Fetching active Bruska catalog snapshot...')

  const allItems: ExternalItem[] = await fetchAllItems(
    payload,
    baseUrl,
    prefix,
    branchId,
    requestHeaders,
  )

  const externalActiveIds = new Set<string>()
  const createdIds: (string | number)[] = []
  const updatedIds: (string | number)[] = []
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

        const currentDefaultTitle =
          typeof current.title === 'string' ? current.title : current.title?.en || ''

        // If the CRM name changed, we update title. If content creators changed localizations
        // on the website but CRM title is identical, we leave localized fields untouched.
        const needsTitleUpdate = item.name && currentDefaultTitle !== item.name
        const needsCodeLinkUpdate = !current.code || current.code !== item._id
        const needsCategoryUpdate = dbCategory !== resolvedCategory

        if (
          dbPrice !== apiPrice ||
          dbStock !== apiStock ||
          needsTitleUpdate ||
          needsCodeLinkUpdate ||
          needsCategoryUpdate
        ) {
          const safeSpecs = Array.isArray(current.technicalSpecs)
            ? current.technicalSpecs.map((spec: any) => ({
                key: spec.key || '',
                value: typeof spec.value === 'string' ? spec.value : spec.value?.en || '',
              }))
            : undefined

          const updateData: Record<string, any> = {
            price: apiPrice,
            stock: apiStock,
            category: resolvedCategory,
          }

          if (needsTitleUpdate) {
            updateData.title = item.name
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

          updatedIds.push(current.id)
        }
      } else {
        payload.logger.info(`✨ Creating product: ${item.name} (external ID: ${item._id})`)

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

        try {
          const created = await payload.create({
            collection: 'products',
            data: productPayloadData,
            locale: DEFAULT_LOCALE,
          })
          payload.logger.info(`✅ Created product ID ${created.id} for "${item.name}"`)
          createdIds.push(created.id)
        } catch (createErr: any) {
          const createErrDetails = createErr?.data?.errors
            ? JSON.stringify(createErr.data.errors)
            : createErr?.message || String(createErr)
          payload.logger.error(
            `❌ CREATE FAILED for "${item.name}" (external ID: ${item._id}): ${createErrDetails}`,
          )
          throw createErr
        }
      }
    } catch (err: any) {
      const errorDetails = err?.data?.errors
        ? JSON.stringify(err.data.errors)
        : err?.message || String(err)

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

  const deletedIds: (string | number)[] = []
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
      deletedIds.push(prod.id)
    }
  }

  return { createdIds, updatedIds, deletedIds, errors }
}
