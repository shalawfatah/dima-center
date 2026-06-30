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
      localized: true, // If you want to translate "CPU" or "Computer Parts"
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        description: 'Used in the URL (e.g., cpu, computer-parts)',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories', // 🔄 Self-referencing relationship
      hasMany: false,
      admin: {
        position: 'sidebar',
        description: 'Leave empty if this is a top-level Main Category.',
      },
    },
  ],
}
