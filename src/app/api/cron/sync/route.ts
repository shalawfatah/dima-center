import { NextResponse } from 'next/server'
import { executeDifferentialSync } from '@/scripts/importBruskCatalog'

// Runs on Netlify's scheduler — no public trigger, no secret needed for this to fire.
// Cron is UTC. 06:00 & 12:00 UTC = 09:00 & 15:00 Istanbul time (UTC+3, currently).
// If Istanbul shifts to UTC+2 for standard time, adjust to '0 7,13 * * *' to keep 9am/3pm local.
export const config = {
  type: 'experimental-scheduled',
  schedule: '0 6,12 * * *',
}

export async function GET(request: Request) {
  // Keep the secret check so you can still manually trigger this via URL for testing/debugging,
  // but it's not required for the scheduled invocation itself.
  const { searchParams } = new URL(request.url)
  const authSecret = searchParams.get('secret')
  if (authSecret !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const summary = await executeDifferentialSync()
    return NextResponse.json({ success: true, ...summary })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
