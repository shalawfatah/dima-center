import { CollectionConfig } from 'payload'

export const PCBuilds: CollectionConfig = {
  slug: 'pc-builds', // ⚡ Matches your page.tsx query exactly!
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'user', 'totalPrice', 'createdAt'],
  },
  access: {
    // Admins can see all builds; customers can only read/write their own builds
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { user: { equals: req.user.id } }
    },
    create: ({ req }) => !!req.user, // Must be logged in to save a build
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { user: { equals: req.user?.id } }
    },
    delete: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { user: { equals: req.user?.id } }
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      defaultValue: 'My Custom PC Build',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false, // One user per build blueprint
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'totalPrice',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    // Grouping the chosen components together cleanly
    {
      name: 'components',
      type: 'group',
      fields: [
        { name: 'cpu', type: 'relationship', relationTo: 'products' },
        { name: 'gpu', type: 'relationship', relationTo: 'products' },
        { name: 'motherboard', type: 'relationship', relationTo: 'products' },
        { name: 'ram', type: 'relationship', relationTo: 'products' },
        { name: 'storage', type: 'relationship', relationTo: 'products' },
        { name: 'psu', type: 'relationship', relationTo: 'products' },
        { name: 'case', type: 'relationship', relationTo: 'products' },
        { name: 'cooler', type: 'relationship', relationTo: 'products' },
      ],
    },
  ],
}
