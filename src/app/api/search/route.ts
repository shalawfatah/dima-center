import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { MAIN_CATEGORY_GROUPS } from '@/utils/categories'

function findCategorySlugFromQuery(query: string): string | null {
  const cleanQuery = query.toLowerCase().trim()
  if (!cleanQuery) return null

  const languages: ('en' | 'ar' | 'ckb')[] = ['en', 'ar', 'ckb']

  for (const lang of languages) {
    const groups = MAIN_CATEGORY_GROUPS[lang] || []
    for (const group of groups) {
      // 1. Direct check against the top-level main category title (e.g., "Laptop", "Monitor")
      if (group.title.toLowerCase() === cleanQuery && group.slug) {
        return group.slug
      }

      // 2. Deep check down into the subcategories arrays
      if (group.subCategories) {
        for (const sub of group.subCategories) {
          // Extracts structural text identifiers inside brackets if present, e.g., "المعالج (CPU)" -> "cpu"
          const titleMatchesClean = sub.title.toLowerCase() === cleanQuery
          const slugMatchesClean = sub.slug.toLowerCase() === cleanQuery
          const structuralBracketMatch = sub.title.toLowerCase().includes(`(${cleanQuery})`)

          if (titleMatchesClean || slugMatchesClean || structuralBracketMatch) {
            return sub.slug
          }
        }
      }
    }
  }

  // Common developer shorthands fallback that may not match structural UI translations directly
  const commonShorthands: Record<string, string> = {
    gpus: 'gpu',
    cpus: 'cpu',
    vga: 'gpu',
    'graphics card': 'gpu',
    'graphic card': 'gpu',
    nvme: 'm2',
    motherboards: 'motherboard',
    mobo: 'motherboard',
    mb: 'motherboard',
    powersupply: 'psu',
    chassis: 'case',
    coolers: 'cooler',
    fans: 'fan',
    laptops: 'laptop',
    monitors: 'monitor',
  }

  return commonShorthands[cleanQuery] || null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const targetLimit = 8

  if (query.trim().length < 1) {
    return NextResponse.json([])
  }

  try {
    const payload = await getPayload({ config })

    // 1. Primary Text Search: Title and Description get top placement priority
    const textSearch = await payload.find({
      collection: 'products',
      locale: 'all', // Returns all localizations structural objects
      where: {
        or: [
          { 'title.en': { contains: query } },
          { 'title.ar': { contains: query } },
          { 'title.ckb': { contains: query } },
          { 'description.en': { contains: query } },
          { 'description.ar': { contains: query } },
          { 'description.ckb': { contains: query } },
        ],
      },
      limit: targetLimit,
    })

    let combinedDocs = [...textSearch.docs]

    // 2. Fallback Category Checking: If results layout isn't full yet, scan structural configuration
    if (combinedDocs.length < targetLimit) {
      const detectedSlug = findCategorySlugFromQuery(query)

      if (detectedSlug) {
        const existingIds = new Set(combinedDocs.map((doc) => String(doc.id)))
        const remainingLimit = targetLimit - combinedDocs.length

        // Fetch products that possess this matching category relationship
        // NOTE: Make sure 'category.slug' matches your collection schema relationship keys!
        const categorySearch = await payload.find({
          collection: 'products',
          locale: 'all',
          where: {
            'category.slug': {
              equals: detectedSlug,
            },
          },
          limit: remainingLimit * 2, // Pull slight extra buffer to safely account for deduplication
        })

        // Inject non-duplicate category entries cleanly to the bottom of the stack
        for (const catDoc of categorySearch.docs) {
          if (combinedDocs.length >= targetLimit) break
          if (!existingIds.has(String(catDoc.id))) {
            combinedDocs.push(catDoc)
          }
        }
      }
    }

    return NextResponse.json(combinedDocs)
  } catch (error) {
    console.error('Payload CMS database search error:', error)
    return NextResponse.json(
      { error: 'Failed to complete item lookup operations.' },
      { status: 500 },
    )
  }
}
