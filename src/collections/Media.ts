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
  // Activating the internal Upload engine layer
  upload: {
    staticDir: 'public/media', // Saves images straight to your Next.js public directory
    mimeTypes: ['image/*'], // Restricts uploads exclusively to valid image file types
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
