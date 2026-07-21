import { validateCrossCollectionSlug } from '@/utils/validate_cross_colletion_slug'
import { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      validate: validateCrossCollectionSlug('ui-categories'),
      admin: {
        description: 'Used in the URL (e.g., cpu, computer-parts)',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'Leave empty if this is a top-level Main Category.',
      },
    },
  ],
}
