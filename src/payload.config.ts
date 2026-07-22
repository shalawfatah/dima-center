import { postgresAdapter } from '@payloadcms/db-postgres'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { s3Storage } from '@payloadcms/storage-s3'
import { Categories } from './collections/Categories'
import { PCBuilds } from './collections/PCBuilds'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { GeneralSettings } from './globals/GeneralSettings'
import { UICategories } from './collections/UICategories'
import { UIProducts } from './collections/UIProducts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    disable: false,
  },
  collections: [Users, Products, Orders, Media, Categories, PCBuilds, UICategories, UIProducts],
  globals: [GeneralSettings],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
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
            const bucketName = process.env.S3_BUCKET || ''
            return `https://${projectRef}.supabase.co/storage/v1/object/public/${bucketName}/${filename}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        // 🎯 FIX: Correct S3 API Route endpoint format for Supabase
        endpoint: process.env.NEXT_PUBLIC_S3_ENDPOIN,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || '',
        forcePathStyle: true,
      },
    }),
  ],
})
