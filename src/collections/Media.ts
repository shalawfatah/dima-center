import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
  },
  access: {
    read: () => true, // Anyone can view images
    create: ({ req: { user } }) => Boolean(user), // Only logged-in users can upload
    update: ({ req: { user } }) => Boolean(user), // Only logged-in users can edit
    delete: ({ req: { user } }) => Boolean(user), // Only logged-in users can delete
  },
  upload: {
    mimeTypes: ['image/*'], // Restricts uploads exclusively to valid image file types
    // staticDir removed — files now go to Garage via s3Storage, not local disk
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      localized: true,
    },
  ],
}
