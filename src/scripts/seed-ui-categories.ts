import { getPayload } from 'payload'
import config from '@payload-config'
import { MAIN_CATEGORY_GROUPS } from '@/utils/categories'

async function seedUICategories() {
  console.log('🚀 Starting UI Categories seed with full localization...')

  const payload = await getPayload({ config })

  // 1. Clear existing UI categories to start clean
  const existing = await payload.find({
    collection: 'ui-categories',
    limit: 500,
  })

  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'ui-categories',
      id: doc.id,
    })
  }
  console.log('🧹 Cleaned up existing UI Categories records.')

  const enGroups = MAIN_CATEGORY_GROUPS.en
  const arGroups = MAIN_CATEGORY_GROUPS.ar
  const ckbGroups = MAIN_CATEGORY_GROUPS.ckb

  for (let i = 0; i < enGroups.length; i++) {
    const enGroup = enGroups[i]
    const arGroup = arGroups[i]
    const ckbGroup = ckbGroups[i]

    const isContainer = !enGroup.slug

    console.log(`Creating: ${enGroup.title}...`)

    // Step A: Create base document in EN
    const doc = await payload.create({
      collection: 'ui-categories',
      locale: 'en',
      data: {
        title: enGroup.title,
        slug: enGroup.slug || '',
        isContainer,
        order: i,
        subCategories: enGroup.subCategories?.map((sub) => ({
          title: sub.title,
          slug: sub.slug,
        })),
      },
    })

    // Step B: Update Arabic (AR) translation
    if (arGroup) {
      await payload.update({
        collection: 'ui-categories',
        id: doc.id,
        locale: 'ar',
        data: {
          title: arGroup.title,
          slug: arGroup.slug || '',
          isContainer,
          order: i,
          subCategories: doc.subCategories?.map((subDoc, subIndex) => ({
            id: subDoc.id, // Preserve row ID so Payload maps array localization correctly
            title: arGroup.subCategories?.[subIndex]?.title || subDoc.title,
            slug: subDoc.slug,
          })),
        },
      })
    }

    // Step C: Update Central Kurdish (CKB) translation
    if (ckbGroup) {
      await payload.update({
        collection: 'ui-categories',
        id: doc.id,
        locale: 'ckb',
        data: {
          title: ckbGroup.title,
          slug: ckbGroup.slug || '',
          isContainer,
          order: i,
          subCategories: doc.subCategories?.map((subDoc, subIndex) => ({
            id: subDoc.id, // Preserve row ID
            title: ckbGroup.subCategories?.[subIndex]?.title || subDoc.title,
            slug: subDoc.slug,
          })),
        },
      })
    }
  }

  console.log('✅ UI Categories successfully seeded for EN, AR, and CKB!')
  process.exit(0)
}

seedUICategories().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
