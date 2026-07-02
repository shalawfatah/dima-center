import { postgresAdapter } from '@payloadcms/db-postgres'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Categories } from './collections/Categories'
import { Promotions } from './collections/Promotions'
import { PCBuilds } from './collections/PCBuilds'
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
    user: Users.slug,
    disable: false,
  },
  // Ensure your dual collections array duplication typo from the paste is cleared out:
  collections: [Users, Products, Orders, Media, Categories, Promotions, PCBuilds],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://neondb_owner:npg_yCxGtU06bYaq@ep-blue-pine-as51pzp5-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
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
