import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })

    // Fetch up to 10 categories from Payload DB
    const categories = await payload.find({
      collection: 'categories',
      limit: 10,
      depth: 1,
    })

    // Log the summary and raw docs to your server console
    console.log('\n=================== CATEGORIES TEST LOG ===================')
    console.log(`Total categories in DB: ${categories.totalDocs}`)
    console.log('First 10 Category Documents:')
    console.dir(categories.docs, { depth: null, colors: true })
    console.log('===========================================================\n')

    return NextResponse.json({
      success: true,
      totalDocs: categories.totalDocs,
      sampleDocs: categories.docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
      })),
    })
  } catch (error: any) {
    console.error('❌ Error fetching categories test:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
