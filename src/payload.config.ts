import { postgresAdapter } from '@payloadcms/db-postgres'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { s3Storage } from '@payloadcms/storage-s3'
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
  collections: [Users, Products, Orders, Media, Categories, Promotions, PCBuilds],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-for-vercel-build-phase',
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
      { label: 'کوردی (Kurdish - Sorani)', code: 'ckb', rtl: true },
      { label: 'English', code: 'en' },
      { label: 'العربية (Arabic)', code: 'ar', rtl: true },
    ],
    defaultLocale: 'ckb',
    fallback: true,
  },
  plugins: [
    s3Storage({
      collections: {
        [Media.slug]: {
          prefix: 'media',
          generateFileURL: ({ filename }: { filename: string }) => {
            return `https://crqqyejtyxqbehfechcg.supabase.co/storage/v1/object/public/media/media/${filename}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || 'media',
      config: {
        endpoint:
          process.env.NEXT_PUBLIC_S3_ENDPOINT ||
          'https://crqqyejtyxqbehfechcg.storage.supabase.co/storage/v1/s3',
        credentials: {
          // 🎯 Crucial: Fallbacks protect Next.js dynamic routing chunks from breaking during Vercel's build pipeline
          accessKeyId: process.env.S3_ACCESS_KEY_ID || 'dummy-key-for-build',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'dummy-secret-for-build',
        },
        region: process.env.S3_REGION || 'eu-central-1',
        forcePathStyle: true,
      },
    }),
  ],
})
