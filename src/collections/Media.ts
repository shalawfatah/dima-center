import { CollectionConfig } from 'payload'
import path from 'path'

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
      'font/ttf',
      'font/otf',
      'font/woff',
      'font/woff2',
      'application/font-woff',
      'application/font-woff2',
      'application/x-font-ttf',
      'application/x-font-opentype',
      'application/octet-stream',
      '.ttf',
      '.otf',
      '.woff',
      '.woff2',
    ],
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.file && req.file.name) {
          const ext = path.extname(req.file.name).toLowerCase()

          // Force correct mimetype for Windows generic uploads
          if (ext === '.ttf') {
            req.file.mimetype = 'font/ttf'
            data.mimeType = 'font/ttf'
          } else if (ext === '.otf') {
            req.file.mimetype = 'font/otf'
            data.mimeType = 'font/otf'
          }
        }
        return data
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
