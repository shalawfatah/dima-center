import { getPayload } from 'payload'
import config from '@/payload.config'

export async function DynamicFonts({ locale }: { locale: string }) {
  const payload = await getPayload({ config })

  // Fetch settings from Payload for the active locale
  const settings = await payload.findGlobal({
    slug: 'general-settings',
    locale: locale as 'en' | 'ar' | 'ckb',
  })

  // 1. Resolve Site Background Color (fallback to #f3f3f3 if empty)
  const siteBgColor = settings?.siteBackground?.backgroundColor || '#f3f3f3'

  // Helper to resolve font media URLs safely
  const getMediaUrl = (media: any): string | null => {
    if (typeof media === 'object' && media !== null && 'url' in media && media.url) {
      return media.url
    }
    if (typeof media === 'string') return media
    return null
  }

  // 2. Resolve locale-specific fonts from typography settings
  const typography = settings?.typography
  let localeFonts: { headingFont?: any; bodyFont?: any } | undefined

  if (locale === 'ckb') {
    localeFonts = typography?.kurdish
  } else if (locale === 'ar') {
    localeFonts = typography?.arabic
  } else {
    localeFonts = typography?.english
  }

  const headingFontUrl = getMediaUrl(localeFonts?.headingFont)
  const bodyFontUrl = getMediaUrl(localeFonts?.bodyFont)

  // 3. Build dynamic @font-face and CSS variable definitions
  let fontStyles = ''

  if (headingFontUrl) {
    fontStyles += `
      @font-face {
        font-family: 'DynamicHeadingFont';
        src: url('${headingFontUrl}') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `
  }

  if (bodyFontUrl) {
    fontStyles += `
      @font-face {
        font-family: 'DynamicBodyFont';
        src: url('${bodyFontUrl}') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `
  }

  return (
    <style>{`
      :root {
        /* Injected dynamically from Payload settings */
        --brand-background: ${siteBgColor};
        ${headingFontUrl ? `--heading-font: 'DynamicHeadingFont', 'Rudaw', sans-serif;` : ''}
        ${bodyFontUrl ? `--body-font: 'DynamicBodyFont', 'Sarchia', sans-serif;` : ''}
      }

      ${fontStyles}
    `}</style>
  )
}
