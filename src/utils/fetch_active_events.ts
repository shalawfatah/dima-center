export async function fetchActiveEvent(payload: any, locale?: string) {
  const now = new Date().toISOString()

  try {
    const res = await payload.find({
      collection: 'events',
      locale: 'all', // 👈 Retrieve all localized objects ({ en: '...', ckb: '...' })
      fallbackLocale: 'en',
      limit: 1,
      depth: 1,
      where: {
        and: [
          { isActive: { equals: true } },
          {
            or: [
              { startDate: { exists: false } },
              { startDate: { equals: null } },
              { startDate: { less_than_equal: now } },
            ],
          },
          {
            or: [
              { endDate: { exists: false } },
              { endDate: { equals: null } },
              { endDate: { greater_than_equal: now } },
            ],
          },
        ],
      },
    })

    return res.docs[0] || null
  } catch (error) {
    console.error('Error fetching active event banner:', error)
    return null
  }
}
