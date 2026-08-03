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
      'font/ttf',
      'font/otf',
      'font/woff',
      'font/woff2',
      'application/font-woff',
      'application/font-woff2',
      'application/x-font-ttf',
      'application/x-font-opentype',
      // Windows sends this for unrecognized types — allow it here,
      // then narrow it down by extension below.
      'application/octet-stream',
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
