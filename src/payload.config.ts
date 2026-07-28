import { postgresAdapter } from '@payloadcms/db-postgres'
import { Media } from './collections/Media'
import { s3Storage } from '@payloadcms/storage-s3'
import { Categories } from './collections/Categories'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { GeneralSettings } from './globals/GeneralSettings'
import { UICategories } from './collections/UICategories'
import { UIProducts } from './collections/UIProducts'
import { Events } from './collections/Events'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    disable: false,
    components: {
      graphics: {
        Icon: '@/components/CustomIcon',
        Logo: '@/components/CustomIcon',
      },
    },
    meta: {
      icons: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          url: '/dima.ico', // Points to public/dima.ico
        },
      ],
    },
  },
  collections: [Users, Products, Media, Categories, UICategories, UIProducts, Events],
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
    push: true,
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
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename }: { filename: string }) => {
            const endpoint = process.env.NEXT_PUBLIC_S3_ENDPOINT || 'https://s3.dima.center'
            const bucketName = process.env.S3_BUCKET || 'media'
            return `${endpoint}/${bucketName}/${filename}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || 'media',
      config: {
        endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'garage',
        forcePathStyle: true, // Standard requirement for self-hosted MinIO/Garage S3
      },
    }),
  ],
})
