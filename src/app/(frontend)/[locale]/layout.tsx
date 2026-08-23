export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Footer from '@/components/Footer'
import FullNavbar from '@/components/FullNavbar'
import { EventBanner } from '@/components/EventBanner'
import { fetchActiveEvent } from '@/utils/fetch_active_events'
import { WhatsappComponent } from '@/components/WhatsappComponent'
import CategoryDropdownNav from '@/components/CategoryCarousel'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

type FontMedia = {
  url?: string
  filename?: string
  mimeType?: string
}

// Best-effort guess at the font MIME/type from filename/url, since
// <link rel="preload" as="font"> needs a `type` to be effective in most browsers.
function guessFontType(fontObj?: FontMedia): string {
  const src = fontObj?.mimeType || fontObj?.filename || fontObj?.url || ''
  if (src.includes('woff2')) return 'font/woff2'
  if (src.includes('woff')) return 'font/woff'
  if (src.includes('.otf')) return 'font/otf'
  if (src.includes('.ttf')) return 'font/ttf'
  return 'font/woff2' // sane default; most modern exports are woff2
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
  const boxBorderColor = typography?.boxBorderColor ?? undefined

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

  const headingFontType = guessFontType(headingFontObj)
  const bodyFontType = guessFontType(bodyFontObj)

  // 6. Build dynamic CSS rules with default fallbacks
  // font-display: optional -> if the font is already cached (returning visits),
  // it renders immediately with no flash. If not cached yet, the browser uses
  // the fallback for that paint and does NOT swap mid-render, avoiding the jitter.
  let fontFaceCSS = ''

  if (headingFontUrl) {
    fontFaceCSS += `
      @font-face {
        font-family: 'CustomHeadingFont';
        src: url('${headingFontUrl}');
        font-display: optional;
      }
    `
  }

  if (bodyFontUrl) {
    fontFaceCSS += `
      @font-face {
        font-family: 'CustomBodyFont';
        src: url('${bodyFontUrl}');
        font-display: optional;
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

  const [categoriesRes] = await Promise.all([
    payload.find({
      collection: 'ui-categories',
      locale: currentLocale as 'en' | 'ar' | 'ckb',
      fallbackLocale: 'en',
      sort: 'order',
      where: {
        hideInCarousel: { equals: false },
      },
      limit: 100,
    }),
  ])

  const categories = categoriesRes.docs.map((doc: any) => ({
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    isContainer: doc.isContainer,
    subCategories: doc.subCategories || [],
  }))

  return (
    <div>
      {/* Preload font files so the browser starts fetching them immediately,
          instead of discovering them only after parsing the <style> block below.
          Next.js App Router automatically hoists these <link> tags into <head>. */}
      {headingFontUrl && (
        <link
          rel="preload"
          href={headingFontUrl}
          as="font"
          type={headingFontType}
          crossOrigin="anonymous"
        />
      )}
      {bodyFontUrl && bodyFontUrl !== headingFontUrl && (
        <link
          rel="preload"
          href={bodyFontUrl}
          as="font"
          type={bodyFontType}
          crossOrigin="anonymous"
        />
      )}

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
          ${boxBorderColor ? `--color-box-border: ${boxBorderColor};` : ''}
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
      <CategoryDropdownNav
        currentLocale={currentLocale}
        categories={categories}
        generalSettings={generalSettings}
      />

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
        borderColor={boxBorderColor}
        generalSettings={generalSettings}
      />
    </div>
  )
}
