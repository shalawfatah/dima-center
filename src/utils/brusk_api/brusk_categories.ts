import { ExternalCategory } from '@/types/brusk_types'
import { slugify } from '@/utils/brusk_api/brusk_slugify'

const DEFAULT_LOCALE = 'en'

export async function syncCategories(
  payload: any,
  baseUrl: string,
  prefix: string,
  branchId: string,
  requestHeaders: Headers,
) {
  const timestamp = Date.now()
  const categoryIdMap = new Map<string, string | number>()
  let syncedCatCount = 0
  let createdCatCount = 0
  let updatedCatCount = 0
  let deletedCatCount = 0

  try {
    const catRes = await fetch(
      `${baseUrl}${prefix}/categories?branchId=${branchId}&t=${timestamp}`,
      { method: 'GET', headers: requestHeaders, cache: 'no-store' },
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
            where: { slug: { equals: finalSlug } },
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
                data: { title: cat.name },
                context: { skipSlugValidation: true },
                locale: DEFAULT_LOCALE,
              })
              updatedCatCount++
            }
          } else {
            payload.logger.info(`✨ Creating new category [slug: ${finalSlug}]: "${cat.name}"`)
            const newCat = await payload.create({
              collection: 'categories',
              data: { title: cat.name, slug: finalSlug },
              context: { skipSlugValidation: true },
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
      data: { title: 'Uncategorized', slug: 'uncategorized' },
      context: { skipSlugValidation: true },
      locale: DEFAULT_LOCALE,
    })
    fallbackCategoryId = fallbackCat.id
  }

  return { categoryIdMap, fallbackCategoryId, syncedCatCount }
}
