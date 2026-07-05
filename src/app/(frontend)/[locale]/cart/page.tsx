import type { Metadata } from 'next'
import { getStorefrontMetadata } from '@/utils/seo'
import CartClientComponent from '@/components/CartClientComponent'

interface CartPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: CartPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const locale = resolvedParams.locale || 'en'

  const baseMeta = await getStorefrontMetadata({ locale })

  const baseSiteTitle =
    baseMeta?.title && typeof baseMeta.title === 'object' && 'absolute' in baseMeta.title
      ? baseMeta.title.absolute
      : typeof baseMeta?.title === 'string'
        ? baseMeta.title
        : 'Storefront'

  const titles: Record<string, string> = {
    en: 'Your Shopping Cart',
    ar: 'حقيبة التسوق الخاصة بك',
    ckb: 'سەبەتەی کڕینەکەت',
  }

  const finalTitle = titles[locale] || titles.en

  return {
    ...baseMeta,
    title: `${finalTitle} | ${baseSiteTitle}`,
    robots: {
      index: false, // Don't waste crawl budget indexing empty cart states
      follow: true,
    },
    openGraph: {
      ...baseMeta?.openGraph,
      title: finalTitle,
    },
  }
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params
  return <CartClientComponent currentLocale={locale} />
}
