import { Validate } from 'payload'

export const validateCrossCollectionSlug = (
  otherCollectionSlug: string,
  checkSubCategories = false,
): Validate<string> => {
  return async (value, { req }) => {
    if (!value) return true // Allow empty if field is optional

    const { payload } = req

    // 1. Check top-level slug in target collection
    const existing = await payload.find({
      collection: otherCollectionSlug as any,
      where: { slug: { equals: value } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      return `The slug "${value}" is already taken in the ${otherCollectionSlug} collection.`
    }

    // 2. Check nested array items (e.g. UICategories subCategories)
    if (checkSubCategories) {
      const existingSub = await payload.find({
        collection: otherCollectionSlug as any,
        where: { 'subCategories.slug': { equals: value } },
        limit: 1,
      })

      if (existingSub.totalDocs > 0) {
        return `The slug "${value}" is already taken inside a sub-category of ${otherCollectionSlug}.`
      }
    }

    return true
  }
}
