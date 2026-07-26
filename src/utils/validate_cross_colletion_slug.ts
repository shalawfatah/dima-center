import { Validate, PayloadRequest } from 'payload'

interface CrossCollectionValidationOptions {
  req: PayloadRequest
  context?: Record<string, any>
  [key: string]: any
}

export const validateCrossCollectionSlug = (
  otherCollectionSlug: 'categories' | 'ui-categories',
): Validate<string> => {
  return async (value, options) => {
    // Cast options to include context safely for TypeScript
    const { req, context } = options as CrossCollectionValidationOptions

    // 1. Skip validation if no slug was entered
    if (!value) return true

    // 2. Allow sync scripts or internal tasks to bypass cross-collection slug validation
    if (context?.skipSlugValidation) return true

    const { payload } = req

    // 3. Check top-level slugs in the opposite collection
    const existingOpposite = await payload.find({
      collection: otherCollectionSlug,
      where: {
        slug: { equals: value },
      },
      limit: 1,
      req,
    })

    if (existingOpposite.totalDocs > 0) {
      return `The slug "${value}" is already used in the ${otherCollectionSlug} collection.`
    }

    // 4. If checking UICategories, also check inside its 'subCategories' array
    if (otherCollectionSlug === 'ui-categories') {
      const existingSub = await payload.find({
        collection: 'ui-categories',
        where: {
          'subCategories.slug': { equals: value },
        },
        limit: 1,
        req,
      })

      if (existingSub.totalDocs > 0) {
        return `The slug "${value}" is already used inside a sub-category of UI Categories.`
      }
    }

    return true
  }
}
