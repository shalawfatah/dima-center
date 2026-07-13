import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config' // 👈 Your Payload config import (or adjust path to your setup)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const locale = searchParams.get('locale') || 'en'

  // Only trigger search if at least 3 characters are typed
  if (query.trim().length < 3) {
    return NextResponse.json([])
  }

  try {
    // 🚀 Initialize Payload's Local API using your config
    const payload = await getPayload({ config })

    // 🔍 Query your "products" collection directly
    const result = await payload.find({
      collection: 'products', // 👈 Update to match your actual products collection slug
      locale: locale as any, // Payload handles the localization queries automatically!
      where: {
        title: {
          like: query, // Using 'like' instead of 'contains' for Postgres search in Payload
        },
      },
      limit: 5, // Keep it snappy for dropdown rendering
    })

    // Payload returns { docs: [...], totalDocs: ... }
    return NextResponse.json(result.docs)
  } catch (error) {
    console.error('Payload CMS database search error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
