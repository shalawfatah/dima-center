import { postgresAdapter } from '@payloadcms/db-postgres'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Categories } from './collections/Categories'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Products } from './collections/Products'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users', // Matches the slug inside the Users collection configuration
  },
  collections: [Users, Products, Orders, Media, Categories],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI || 'postgres://postgres:<passhere>@127.0.0.1:5432/nima-center',
    },
  }),
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'العربية (Arabic)', code: 'ar', rtl: true },
      { label: 'کوردی (Kurdish - Sorani)', code: 'ckb', rtl: true },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
})
