import { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    // 🔒 Fix: Allow users to query and read their own orders
    read: ({ req }) => {
      // If no user is logged in, deny access completely
      if (!req.user) return false

      // If admin, let them see all orders
      if (req.user.role === 'admin') return true

      // If customer, restrict query results strictly to their own rows
      return {
        user: {
          equals: req.user.id,
        },
      }
    },
    // Keep your other access control methods (create, update) here...
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'processing',
      options: [
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
      ],
    },
  ],
}
