import { getPayload } from 'payload'
import config from '@/payload.config'
import { headers } from 'next/headers'
import PcBuilderClient from '@/components/PcBuilderClient'

import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'

interface PcBuilderPageProps {
  params: Promise<{ locale: string }>
}

// 🎯 DYNAMIC PC BUILDER METADATA
export async function generateMetadata({ params }: PcBuilderPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const locale = resolvedParams.locale || 'en'

  // 1. Grab foundational settings (canonical targets, base domain parameters, etc.)
  const baseMeta = await getStorefrontMetadata({ locale })

  // 2. Localized content sets for interactive utility pages
  const titles: Record<string, string> = {
    en: 'Custom PC Builder - Build Your Own Desktop',
    ar: 'مُدمج الكمبيوتر المخصص - ابنِ جهازك الخاص',
    ckb: 'بەشێکردنی کۆمپیوتەر - کۆمپیوتەری خۆت دروست بکە',
  }

  const descriptions: Record<string, string> = {
    en: 'Choose compatible components, estimate total costs, and build your custom desktop setup using our interactive platform with real-time local stock and pricing matrix.',
    ar: 'اختر القطع المتوافقة، واحسب التكلفة الإجمالية، وابنِ تجميعة الكمبيوتر الخاصة بك مع تحديثات فورية للأسعار والمخزون المحلي.',
    ckb: 'پاڵپشتی و گونجانی پارچەکان دیاریبکە، تێچووی گشتی بخەمڵێنە، و کۆمپیوتەری دڵخوازی خۆت دروست بکە بە نرخی پێشبڕکێیی بازاڕ.',
  }

  const finalTitle = titles[locale] || titles.en
  const finalDescription = descriptions[locale] || descriptions.en

  // 3. Clean extraction bypassing missing Next.js interface definitions safely
  const titleValue = baseMeta?.title as any
  const baseSiteTitle =
    titleValue && typeof titleValue === 'object'
      ? titleValue.absolute || titleValue.default
      : typeof titleValue === 'string'
        ? titleValue
        : 'Storefront'

  return {
    ...baseMeta,
    title: `${finalTitle} | ${baseSiteTitle}`,
    description: finalDescription,
    openGraph: {
      ...baseMeta?.openGraph,
      title: finalTitle,
      description: finalDescription,
    },
  }
}

export default async function PcBuilderPage({ params }: PcBuilderPageProps) {
  const { locale } = await params
  const payload = await getPayload({ config })

  // 🔐 Check user session status securely on the server
  const { user } = await payload.auth({ headers: await headers() })

  // 🚀 Fetch all active products to act as components with strict field criteria
  const productsData = await payload.find({
    collection: 'products',
    limit: 5000, // Force lift the 100-item cap to capture complete component inventory
    locale: locale as 'en' | 'ar' | 'ckb',
    // ⚡ Select only required attributes to strip heavy timestamps/unneeded data payloads
    select: {
      title: true,
      price: true,
      cat: true,
    },
  })

  // Group products by categories or simply pass them directly
  const products = productsData.docs
  const isRtl = locale === 'ar' || locale === 'ckb'

  return <PcBuilderClient products={products} user={user} currentLocale={locale} isRtl={isRtl} />
}
