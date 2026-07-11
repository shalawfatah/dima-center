import { NextResponse } from 'next/server'
import { executeDifferentialSync } from '../../../../scripts/importBruskCatalog'

export const maxDuration = 300 // Allows execution up to 5 minutes on Vercel Pro if needed

export async function GET(request: Request) {
  // Protect your endpoint using a secret token so strangers can't trigger it
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
