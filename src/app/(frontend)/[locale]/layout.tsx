export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Footer from '@/components/Footer'
import FullNavbar from '@/components/FullNavbar'

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
        // Note: 'ku' is standard for Kurdish, mapping perfectly to your 'ckb' route variant
        ku: `${baseUrl}/ckb`,
        'x-default': `${baseUrl}/en`,
      },
    },
  }
}

export default async function LocalizedLayout({ children, params }: LayoutProps) {
  const { locale } = await params

  return (
    <div>
      <FullNavbar currentLocale={locale} />

      {children}

      <Footer currentLocale={locale} />
    </div>
  )
}
