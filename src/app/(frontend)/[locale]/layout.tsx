export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Footer from '@/components/Footer'
import FullNavbar from '@/components/FullNavbar'
import { EventBanner } from '@/components/EventBanner'
import { fetchActiveEvent } from '@/utils/fetch_active_events'
import { WhatsappComponent } from '@/components/WhatsappComponent'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// 🟢 FIX: Dynamic absolute metadata generation for canonical and hreflang links
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  // Uses your Vercel/Production domain environment variable, falling back to your domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dima.center'

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        en: `${baseUrl}/en`,
        ar: `${baseUrl}/ar`,
        ku: `${baseUrl}/ckb`,
        'x-default': `${baseUrl}/en`,
      },
    },
  }
}

export default async function LocalizedLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  // 1. Sanitize locale (fallback to 'en' if invalid)
  const currentLocale = locale === 'en' || locale === 'ar' || locale === 'ckb' ? locale : 'en'

  // 2. Compute isRtl
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  // 3. Initialize Payload CMS instance
  const payload = await getPayload({ config })

  // 4. Fetch active event banner data
  const activeEvent = await fetchActiveEvent(payload, currentLocale)

  return (
    <div>
      <FullNavbar currentLocale={currentLocale} />
      <EventBanner bannerData={activeEvent} currentLocale={currentLocale} isRtl={isRtl} />
      {children}
      <WhatsappComponent phoneNumber="9647701414269" businessName="Customer Support" />
      <Footer currentLocale={currentLocale} />
    </div>
  )
}
