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
import { GeneralSettings } from './globals/GeneralSettings'
import { CaseOffers } from './collections/CaseOffers'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    disable: false,
  },
  collections: [Users, Products, Orders, Media, Categories, Promotions, PCBuilds, CaseOffers],
  globals: [GeneralSettings],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-for-vercel-build-phase',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
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
          disablePayloadAccessControl: true, // ⚡ Directly stream assets from Supabase CDN bypasses function overload
          generateFileURL: ({ filename }: { filename: string }) => {
            // ⚡ Tells Payload exactly how to read the public URL from Supabase
            const projectRef = 'crqqyejtyxqbehfechcg'
            const bucketName = process.env.S3_BUCKET || 'media'
            return `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/${filename}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || 'media',
      config: {
        // 🎯 FIX: Correct S3 API Route endpoint format for Supabase
        endpoint:
          process.env.NEXT_PUBLIC_S3_ENDPOINT ||
          'https://crqqyejtyxqbehfechcg.supabase.co/storage/v1/s3',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || 'dummy-key-for-build',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'dummy-secret-for-build',
        },
        region: process.env.S3_REGION || 'eu-central-1',
        forcePathStyle: true,
      },
    }),
  ],
})
