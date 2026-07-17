import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const locale = searchParams.get('locale') || 'en'

  if (query.trim().length < 1) {
    return NextResponse.json([])
  }

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'products',
      // Using 'all' ensures localized string formats return properly to your mapping functions
      locale: 'all',
      where: {
        or: [
          { 'title.en': { contains: query } },
          { 'title.ar': { contains: query } },
          { 'title.ckb': { contains: query } },
        ],
      },
      limit: 6,
    })

    return NextResponse.json(result.docs)
  } catch (error) {
    console.error('Payload CMS database search error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
