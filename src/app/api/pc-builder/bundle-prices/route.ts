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

  console.log('[bundle-route] incoming items:', body.items)

  let config
  try {
    config = getBruskConfig()
  } catch {
    console.error('[bundle-route] getBruskConfig failed — check BRUSK_* env vars')
    return NextResponse.json({ error: 'Bundle pricing not configured' }, { status: 500 })
  }

  const url = `${config.baseUrl}${config.prefix}/items/availability-items/${config.branchId}`
  console.log('[bundle-route] → upstream URL:', url)

  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      ...Object.fromEntries(config.requestHeaders.entries()),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ items: body.items }),
    cache: 'no-store',
  })

  console.log('[bundle-route] ← upstream status:', upstream.status)

  if (!upstream.ok) {
    const errText = await upstream.clone().text()
    console.error('[bundle-route] upstream error body:', errText.slice(0, 500))
    return NextResponse.json(
      { error: `Upstream error ${upstream.status}` },
      { status: upstream.status },
    )
  }

  const data = await upstream.json()

  console.log(
    '[bundle-route] upstream items:',
    (data?.record?.items ?? []).map((it: any) => ({
      barcode: it.barcode,
      name: it.name,
      sellingPriceDollar: it.sellingPriceDollar,
      sellingPriceMultipleDollar: it.sellingPriceMultipleDollar,
      sellingPriceMultiple: it.sellingPriceMultiple,
      hasBundleField: 'sellingPriceMultipleDollar' in it,
      bundleFieldType: typeof it.sellingPriceMultipleDollar,
    })),
  )

  return NextResponse.json(data)
}
