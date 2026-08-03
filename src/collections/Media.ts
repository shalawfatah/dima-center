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
      'application/octet-stream', // Allow generic stream so Windows can pass it through
    ],
  },
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Check if a file was uploaded and has a filename
        if (req.file && req.file.name) {
          const ext = path.extname(req.file.name).toLowerCase()

          // Fix Windows generic/missing mimetypes for fonts
          if (
            ext === '.ttf' &&
            (req.file.mimetype === 'application/octet-stream' || !req.file.mimetype)
          ) {
            req.file.mimetype = 'font/ttf'
            data.mimeType = 'font/ttf'
          } else if (
            ext === '.otf' &&
            (req.file.mimetype === 'application/octet-stream' || !req.file.mimetype)
          ) {
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
