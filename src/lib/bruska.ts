// lib/bruska.ts
const BASE = 'https://saaser.tadbeersoft.com/api/public/cms'
const headers = {
  apikey: process.env.BRUSKA_API_KEY!,
  secretkey: process.env.BRUSKA_SECRET_KEY!,
}

export async function getItems(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/items?${qs}`, { headers }) // follows 302 by default
  if (!res.ok) throw new Error(`Bruska error ${res.status}`)
  return res.json()
}

export async function placeOrder(payload: object) {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}
