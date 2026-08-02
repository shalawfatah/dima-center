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

type FontMedia = {
  url?: string
  filename?: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
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

  // 1. Sanitize locale (fallback to 'en')
  const currentLocale = locale === 'en' || locale === 'ar' || locale === 'ckb' ? locale : 'en'
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  // 2. Initialize Payload
  const payload = await getPayload({ config })

  // 3. Fetch data concurrently (pass currentLocale & depth: 1 to resolve media relations)
  const [activeEvent, generalSettings] = await Promise.all([
    fetchActiveEvent(payload, currentLocale),
    payload.findGlobal({
      slug: 'general-settings',
      locale: currentLocale as 'en' | 'ar' | 'ckb',
      depth: 1, // Crucial: populates font relationship objects so fontObj.url exists
    }),
  ])

  // 4. Extract typography data
  const typography = generalSettings?.typography
  const titleColor = typography?.titleColor ?? undefined
  const bodyColor = typography?.bodyColor ?? undefined
  const boxBgColor = typography?.boxBackgroundColor ?? undefined

  // 5. Resolve active locale's fonts (ckb, ar, or en)
  const localeToTypographyKey = {
    ckb: 'kurdish',
    ar: 'arabic',
    en: 'english',
  } as const

  const typographyKey = localeToTypographyKey[currentLocale as keyof typeof localeToTypographyKey]
  const fontGroup = typography?.[typographyKey]
  const headingFontObj = fontGroup?.headingFont as FontMedia | undefined
  const bodyFontObj = fontGroup?.bodyFont as FontMedia | undefined

  const headingFontUrl = headingFontObj?.url
  const bodyFontUrl = bodyFontObj?.url

  // 6. Build dynamic CSS rules with default fallbacks
  let fontFaceCSS = ''

  if (headingFontUrl) {
    fontFaceCSS += `
      @font-face {
        font-family: 'CustomHeadingFont';
        src: url('${headingFontUrl}');
        font-display: swap;
      }
    `
  }

  if (bodyFontUrl) {
    fontFaceCSS += `
      @font-face {
        font-family: 'CustomBodyFont';
        src: url('${bodyFontUrl}');
        font-display: swap;
      }
    `
  }

  // Build heading and body font strings for components
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)
  const headingFont = headingFontUrl
    ? `'CustomHeadingFont', ${isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'}`
    : isRegionalLocale
      ? '"Rudaw", sans-serif'
      : 'inherit'
  const bodyFont = bodyFontUrl
    ? `'CustomBodyFont', ${isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'}`
    : isRegionalLocale
      ? '"Rudaw", sans-serif'
      : 'inherit'

  const phoneNumber = generalSettings?.phone || '9647701414269'

  return (
    <div>
      {/* Dynamic Font & Variable Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        ${fontFaceCSS}
        :root {
          --font-heading: ${headingFontUrl ? "'CustomHeadingFont', inherit" : 'inherit'};
          --font-body: ${bodyFontUrl ? "'CustomBodyFont', inherit" : 'inherit'};
          ${titleColor ? `--color-title: ${titleColor};` : ''}
          ${bodyColor ? `--color-body: ${bodyColor};` : ''}
          ${boxBgColor ? `--color-box-bg: ${boxBgColor};` : ''}
        }

        body {
          font-family: var(--font-body);
          ${bodyColor ? `color: ${bodyColor};` : ''}
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading);
          ${titleColor ? `color: ${titleColor};` : ''}
        }
      `,
        }}
      />

      <FullNavbar currentLocale={currentLocale} />
      <EventBanner
        bannerData={activeEvent}
        currentLocale={currentLocale}
        isRtl={isRtl}
        headingFont={headingFont}
        bodyFont={bodyFont}
        dynamicFontFaceCSS={fontFaceCSS}
      />
      {children}
      <WhatsappComponent phoneNumber={phoneNumber} />
      <Footer
        currentLocale={currentLocale}
        titleColor={titleColor}
        bodyColor={bodyColor}
        generalSettings={generalSettings}
      />
    </div>
  )
}
