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
    mimeTypes: [
      'image/*',
      'font/ttf',
      'font/otf',
      'font/woff',
      'font/woff2',
      'application/font-woff',
      'application/font-woff2',
      'application/x-font-ttf',
      'application/x-font-opentype',
    ],
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
