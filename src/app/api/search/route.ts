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
      if (group.title.toLowerCase() === cleanQuery && group.slug) {
        return group.slug
      }

      if (group.subCategories) {
        for (const sub of group.subCategories) {
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

  // 🎯 Extract active locale passed from search fetch (defaults to 'en')
  const reqLocale = searchParams.get('locale') || 'en'
  const activeLocale = (['en', 'ar', 'ckb'].includes(reqLocale) ? reqLocale : 'en') as
    'en' | 'ar' | 'ckb'

  const targetLimit = 8

  if (query.trim().length < 1) {
    return NextResponse.json([])
  }

  try {
    const payload = await getPayload({ config })

    // 1. Primary Text Search using the requested locale for field resolution
    const textSearch = await payload.find({
      collection: 'products',
      locale: activeLocale, // 👈 Passes active locale to Payload so doc.title is a clean string!
      where: {
        and: [
          { stock: { greater_than: 0 } },
          {
            or: [
              { 'title.en': { contains: query } },
              { 'title.ar': { contains: query } },
              { 'title.ckb': { contains: query } },
              { 'description.en': { contains: query } },
              { 'description.ar': { contains: query } },
              { 'description.ckb': { contains: query } },
            ],
          },
        ],
      },
      limit: targetLimit,
    })

    const combinedDocs = [...textSearch.docs]

    // 2. Fallback Category Checking
    if (combinedDocs.length < targetLimit) {
      const detectedSlug = findCategorySlugFromQuery(query)

      if (detectedSlug) {
        const existingIds = new Set(combinedDocs.map((doc) => String(doc.id)))
        const remainingLimit = targetLimit - combinedDocs.length

        const categorySearch = await payload.find({
          collection: 'products',
          locale: activeLocale, // 👈 Ensures localized fields match requested locale
          where: {
            and: [
              { stock: { greater_than: 0 } },
              {
                'category.slug': {
                  equals: detectedSlug,
                },
              },
            ],
          },
          limit: remainingLimit * 2,
        })

        for (const catDoc of categorySearch.docs) {
          if (combinedDocs.length >= targetLimit) break
          if (!existingIds.has(String(catDoc.id))) {
            combinedDocs.push(catDoc)
          }
        }
      }
    }

    // 3. Format payload output structural objects
    const sanitizedResults = combinedDocs.map((doc: any) => {
      const categorySlug =
        typeof doc.category === 'object' && doc.category !== null
          ? doc.category.slug || 'all'
          : 'all'

      // Helper to extract localized text if Payload still passes fallback dictionary
      const extractString = (val: any) => {
        if (!val) return ''
        if (typeof val === 'string') {
          if (val.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(val)
              return parsed[activeLocale] || parsed.en || parsed.ckb || parsed.ar || ''
            } catch {
              return val
            }
          }
          return val
        }
        if (typeof val === 'object') {
          return val[activeLocale] || val.en || val.ckb || val.ar || Object.values(val)[0] || ''
        }
        return String(val)
      }

      return {
        id: doc.id,
        slug: doc.slug || doc.id,
        categorySlug,
        title: extractString(doc.title),
        name: extractString(doc.name),
        price: doc.price,
        featuredImage: doc.featuredImage || doc.featured_image || null,
      }
    })

    return NextResponse.json(sanitizedResults)
  } catch (error) {
    console.error('Payload CMS database search error:', error)
    return NextResponse.json(
      { error: 'Failed to complete item lookup operations.' },
      { status: 500 },
    )
  }
}
