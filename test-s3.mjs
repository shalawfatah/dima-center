import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import 'dotenv/config'

const client = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT,
  region: process.env.S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})

try {
  const res = await client.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: 'white_gaming_pc.avif', // pick a filename you know exists
    }),
  )
  console.log('SUCCESS', res.$metadata)
} catch (err) {
  console.log('RAW ERROR OBJECT:')
  console.dir(err, { depth: null })
}
