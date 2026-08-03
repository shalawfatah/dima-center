import { getPayload } from 'payload'
import config from '@/payload.config'
import PcBuilderClient from '@/components/PcBuilderClient'
import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  return getStorefrontMetadata({ locale: resolvedParams.locale })
}

export const revalidate = 3600

export default async function PcBuilderPage({ params }: PageProps) {
  const { locale } = await params
  const payload = await getPayload({ config })

  const [productsData, generalsData] = await Promise.all([
    payload.find({
      collection: 'products',
      where: {
        stock: { greater_than: 0 },
      },
      select: {
        id: true,
        title: true,
        price: true,
        priceIQD: true,
        hasDiscount: true,
        discountType: true,
        discountValue: true,
        category: true,
        cat: true,
        featuredImage: true,
        meta: true,
      },
      limit: 0,
      pagination: false,
      locale: locale as 'en' | 'ar' | 'ckb',
    }),
    payload
      .findGlobal({
        slug: 'general-settings',
        locale: locale as 'en' | 'ar' | 'ckb',
        depth: 1,
      })
      .catch(() => null),
  ])

  const isRtl = locale === 'ar' || locale === 'ckb'
  const typography = generalsData?.typography
  const localeMap = {
    ckb: 'kurdish',
    ar: 'arabic',
    en: 'english',
  } as const
  const fontGroupKey = localeMap[locale as keyof typeof localeMap]
  const fontGroup = typography?.[fontGroupKey]

  const headingFontObj = fontGroup?.headingFont
  const bodyFontObj = fontGroup?.bodyFont

  let headingFont = isRtl ? '"Rudaw", sans-serif' : 'system-ui, sans-serif'
  let bodyFont = isRtl ? '"Sarchia", sans-serif' : 'system-ui, sans-serif'
  let dynamicFontFaceCSS = ''

  // Extract colors from general settings
  const titleColor = typography?.titleColor || undefined
  const bodyColor = typography?.bodyColor || undefined
  const boxBgColor = typography?.boxBackgroundColor || undefined
  const boxBorderColor = typography?.boxBorderColor || undefined

  if (headingFontObj && typeof headingFontObj === 'object' && headingFontObj.url) {
    const fontName = `PcBuilderHeading_${locale}`
    headingFont = `"${fontName}", "Rudaw", sans-serif`
    dynamicFontFaceCSS += `
      @font-face {
        font-family: '${fontName}';
        src: url('${headingFontObj.url}') format('truetype');
        font-display: swap;
      }
    `
  }

  if (bodyFontObj && typeof bodyFontObj === 'object' && bodyFontObj.url) {
    const fontName = `PcBuilderBody_${locale}`
    bodyFont = `"${fontName}", "Sarchia", sans-serif`
    dynamicFontFaceCSS += `
      @font-face {
        font-family: '${fontName}';
        src: url('${bodyFontObj.url}') format('truetype');
        font-display: swap;
      }
    `
  }

  const sanitizedGenerals = generalsData
    ? JSON.parse(JSON.stringify(generalsData, (_, value) => (value === null ? undefined : value)))
    : undefined

  return (
    <PcBuilderClient
      products={productsData.docs}
      generals={sanitizedGenerals}
      currentLocale={locale}
      isRtl={isRtl}
      headingFont={headingFont}
      bodyFont={bodyFont}
      dynamicFontFaceCSS={dynamicFontFaceCSS}
      titleColor={titleColor}
      bodyColor={bodyColor}
      boxBgColor={boxBgColor}
      boxBorderColor={boxBorderColor}
    />
  )
}
