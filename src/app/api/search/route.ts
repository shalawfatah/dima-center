import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const locale = searchParams.get('locale') || 'en'

  // Trigger database query as long as 1 character is present
  if (query.trim().length < 1) {
    return NextResponse.json([])
  }

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'products',
      locale: locale as any,
      where: {
        title: {
          like: query,
        },
      },
      limit: 6, // Snappy dropdown sizing
    })

    return NextResponse.json(result.docs)
  } catch (error) {
    console.error('Payload CMS database search error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
