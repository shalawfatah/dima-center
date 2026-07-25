import type { Config } from '@netlify/functions'

const handler = async () => {
  const url = `${process.env.URL}/api/cron/sync?secret=${process.env.CRON_SECRET}`
  const res = await fetch(url)
  console.log(`Sync trigger responded with status ${res.status}`)
}

export default handler

export const config: Config = {
  schedule: '0 6,13 * * *',
}
