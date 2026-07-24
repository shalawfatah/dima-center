import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    // 🔒 Hide the Users collection from non-super-admins in the sidebar
    hidden: ({ user }) => user?.role !== 'super-admin',
  },
  access: {
    // 🔒 Access to log into the /admin dashboard (both admins and super-admins need access)
    admin: ({ req }) => req.user?.role === 'super-admin' || req.user?.role === 'admin',

    // 🔒 Creating new user documents (ONLY super-admin)
    create: ({ req }) => req.user?.role === 'super-admin',

    // 🔒 Reading users (super-admin reads all; admins/customers can only read their own profile)
    read: ({ req }) => {
      if (req.user?.role === 'super-admin') return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },

    // 🔒 Updating users (super-admin can update any; regular admin can update themselves, but not change role)
    update: ({ req }) => {
      if (req.user?.role === 'super-admin') return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },

    // 🔒 Deleting users (ONLY super-admin)
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'customer',
      options: [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Customer', value: 'customer' },
      ],
      access: {
        // 🔒 Only a super-admin can assign or change roles
        create: ({ req }) => req.user?.role === 'super-admin',
        update: ({ req }) => req.user?.role === 'super-admin',
      },
    },
  ],
}
