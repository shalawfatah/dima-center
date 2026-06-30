import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    // 🔒 If a customer tries to load /admin, this hides the panel entirely from them
    hidden: ({ user }) => {
      // If there is no user, or they aren't an admin, hide the dashboard view
      return user?.role !== 'admin'
    },
  },
  access: {
    // 🔒 Protect raw API/REST operations
    admin: ({ req }) => req.user?.role === 'admin',
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return { id: { equals: req.user?.id } }
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'customer',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Customer', value: 'customer' },
      ],
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
    },
  ],
}
