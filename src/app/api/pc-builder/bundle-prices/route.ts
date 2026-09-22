// src/app/api/pc-builder/bundle-prices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getBruskConfig } from '@/utils/brusk_api/brusk_client'

type Body = {
  items: Array<{ barcode: string; quantity: number }>
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!Array.isArray(body?.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Items are required' }, { status: 400 })
  }

  let config
  try {
    config = getBruskConfig()
  } catch (err: any) {
    // Missing env creds — surface clearly, don't leak names to client
    return NextResponse.json({ error: 'Bundle pricing not configured' }, { status: 500 })
  }

  const url = `${config.baseUrl}${config.prefix}/items/availability-items/${config.branchId}`

  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      ...Object.fromEntries(config.requestHeaders.entries()),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ items: body.items }),
    // don't cache — prices change
    cache: 'no-store',
  })

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Upstream error ${upstream.status}` },
      { status: upstream.status },
    )
  }

  const data = await upstream.json()
  return NextResponse.json(data)
}
