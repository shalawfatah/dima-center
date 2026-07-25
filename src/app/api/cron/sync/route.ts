import { NextResponse } from 'next/server'
import { executeDifferentialSync } from '@/scripts/importBruskCatalog'

export async function GET(request: Request) {
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
