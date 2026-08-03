import { CollectionConfig } from 'payload'
import path from 'path'

const fontExtToMime: Record<string, string> = {
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    mimeTypes: [
      'image/*',
      'font/*',
      'application/octet-stream',
      'application/font-woff',
      'application/font-woff2',
    ],
  },
  hooks: {
    beforeOperation: [
      ({ req, operation }) => {
        if ((operation === 'create' || operation === 'update') && req.file) {
          const ext = path.extname(req.file.name || '').toLowerCase()
          const correctMime = fontExtToMime[ext]

          if (
            correctMime &&
            (req.file.mimetype === 'application/octet-stream' || !req.file.mimetype)
          ) {
            req.file.mimetype = correctMime
          }
        }
      },
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
