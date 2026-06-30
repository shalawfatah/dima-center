import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
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
      required: true,
      localized: true, // Let's translate image labels for accessibility
    },
  ],
}
