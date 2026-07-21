import { Validate } from 'payload'

export const validateCrossCollectionSlug = (
  otherCollectionSlug: 'categories' | 'ui-categories',
): Validate<string> => {
  return async (value, { req, id, operation }) => {
    // Skip validation if no slug was entered (since UICategories slug is optional)
    if (!value) return true

    const { payload } = req

    // 1. Check top-level slugs in the opposite collection
    const existingOpposite = await payload.find({
      collection: otherCollectionSlug,
      where: {
        slug: { equals: value },
      },
      limit: 1,
    })

    if (existingOpposite.totalDocs > 0) {
      return `The slug "${value}" is already used in the ${otherCollectionSlug} collection.`
    }

    // 2. If checking UICategories, also check inside its 'subCategories' array
    if (otherCollectionSlug === 'ui-categories') {
      const existingSub = await payload.find({
        collection: 'ui-categories',
        where: {
          'subCategories.slug': { equals: value },
        },
        limit: 1,
      })

      if (existingSub.totalDocs > 0) {
        return `The slug "${value}" is already used inside a sub-category of UI Categories.`
      }
    }

    return true
  }
}
