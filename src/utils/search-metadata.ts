import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'

interface GetSearchMetadataArgs {
  locale: string
  query: string
}

const TITLES: Record<string, (query: string) => string> = {
  en: (query) => (query ? `Search results for "${query}"` : 'Search Products'),
  ar: (query) => (query ? `نتائج البحث عن "${query}"` : 'البحث عن المنتجات'),
  ckb: (query) => (query ? `ئەنجامەکانی گەڕان بۆ "${query}"` : 'گەڕان بۆ بەرهەمەکان'),
}

const DESCRIPTIONS: Record<string, (query: string) => string> = {
  en: (query) => `Browse results matching "${query}" on our marketplace.`,
  ar: (query) => `تصفح النتائج المطابقة لـ "${query}" في متجرنا.`,
  ckb: (query) => `سەیری ئەو ئەنجامانە بکە کە دەطابن لەگەڵ "${query}" لە کۆگاکەماندا.`,
}

/**
 * Builds the Metadata object for the search results page, localized to
 * `locale` and reflecting the current `query`.
 */
export async function getSearchPageMetadata({
  locale,
  query,
}: GetSearchMetadataArgs): Promise<Metadata> {
  const baseMeta = await getStorefrontMetadata({ locale })

  const finalTitle = (TITLES[locale] || TITLES.en)(query)
  const finalDescription = (DESCRIPTIONS[locale] || DESCRIPTIONS.en)(query)

  return {
    ...baseMeta,
    title: finalTitle,
    description: finalDescription,
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      ...baseMeta?.openGraph,
      title: finalTitle,
      description: finalDescription,
    },
  }
}
