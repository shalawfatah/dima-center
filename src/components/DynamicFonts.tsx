import { getPayload } from 'payload'
import configPromise from '@payload-config'

type MediaObj = { url?: string } | null | undefined

export async function DynamicFonts({ locale }: { locale: string }) {
  const payload = await getPayload({ config: configPromise })

  // Fetch general-settings global from Payload
  const settings = await payload.findGlobal({
    slug: 'general-settings',
    depth: 1, // Populate the media relationships
  })

  const typography = settings?.typography
  if (!typography) return null

  // Extract uploaded font objects
  const kurdishHeading = (typography.kurdish?.headingFont as MediaObj)?.url
  const kurdishBody = (typography.kurdish?.bodyFont as MediaObj)?.url

  const arabicHeading = (typography.arabic?.headingFont as MediaObj)?.url
  const arabicBody = (typography.arabic?.bodyFont as MediaObj)?.url

  const englishHeading = (typography.english?.headingFont as MediaObj)?.url
  const englishBody = (typography.english?.bodyFont as MediaObj)?.url

  // Generate dynamic @font-face rules if custom uploads exist
  let fontFaceRules = ''

  if (kurdishHeading) {
    fontFaceRules += `
      @font-face {
        font-family: 'CustomKurdishHeading';
        src: url('${kurdishHeading}');
        font-display: swap;
      }
    `
  }
  if (kurdishBody) {
    fontFaceRules += `
      @font-face {
        font-family: 'CustomKurdishBody';
        src: url('${kurdishBody}');
        font-display: swap;
      }
    `
  }

  if (arabicHeading) {
    fontFaceRules += `
      @font-face {
        font-family: 'CustomArabicHeading';
        src: url('${arabicHeading}');
        font-display: swap;
      }
    `
  }
  if (arabicBody) {
    fontFaceRules += `
      @font-face {
        font-family: 'CustomArabicBody';
        src: url('${arabicBody}');
        font-display: swap;
      }
    `
  }

  if (englishHeading) {
    fontFaceRules += `
      @font-face {
        font-family: 'CustomEnglishHeading';
        src: url('${englishHeading}');
        font-display: swap;
      }
    `
  }
  if (englishBody) {
    fontFaceRules += `
      @font-face {
        font-family: 'CustomEnglishBody';
        src: url('${englishBody}');
        font-display: swap;
      }
    `
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          ${fontFaceRules}

          /* Default Fallback Variables */
          :root {
            --heading-font: 'Rudaw', 'Roboto Mono', sans-serif;
            --body-font: 'Sarchia', system-ui, sans-serif;
          }

          /* Kurdish Override */
          html[lang='ckb'] {
            --heading-font: ${kurdishHeading ? "'CustomKurdishHeading', " : ''}'Rudaw', sans-serif;
            --body-font: ${kurdishBody ? "'CustomKurdishBody', " : ''}'Sarchia', 'Rudaw', sans-serif;
          }

          /* Arabic Override */
          html[lang='ar'] {
            --heading-font: ${arabicHeading ? "'CustomArabicHeading', " : ''}'Rudaw', sans-serif;
            --body-font: ${arabicBody ? "'CustomArabicBody', " : ''}'Sarchia', 'Rudaw', sans-serif;
          }

          /* English Override */
          html[lang='en'] {
            --heading-font: ${englishHeading ? "'CustomEnglishHeading', " : ''}'Roboto Mono', sans-serif;
            --body-font: ${englishBody ? "'CustomEnglishBody', " : ''}system-ui, sans-serif;
          }
        `,
      }}
    />
  )
}
