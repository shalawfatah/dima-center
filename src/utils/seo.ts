import type { Metadata } from 'next'

interface SeoParams {
  locale: string
}

// TODO: replace with your real production domain, or read from an env var
// (e.g. process.env.NEXT_PUBLIC_SITE_URL) so it's easy to swap per environment.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dima-center.com'

export async function getStorefrontMetadata(params: SeoParams): Promise<Metadata> {
  const locale = params.locale || 'en'
  const seo = {
    en: {
      title: 'Dima Center | Premium PC Components Shop',
      description:
        'Find high-performance CPUs, Graphics Cards, Motherboards, and gaming accessories in Iraq. Great prices and reliable hardware.',
    },
    ar: {
      title: 'ديما کمبیوتر | متجر قطع ومكونات الكمبيوتر',
      description:
        'اكتشف أفضل قطع الكمبيوتر في العراق: معالجات، كروت شاشة، لوحات أم، وإكسسوارات جيمنج بأفضل الأسعار.',
    },
    ckb: {
      title: 'دیما سەنتەر | فرۆشگای پارچە و پێکهاتەکانی کۆمپیوتەر',
      description:
        'باشترین پارچەکانی کۆمپیوتەر لە عێراق بەدەستبهێنە: پڕۆسێسەر، کارتی شاشە، مازەربۆرد و ئێکسسواراتی یاریکردن بە گونجاوترین نرخ.',
    },
  }
  const currentSeo = seo[locale as 'en' | 'ar' | 'ckb'] || seo.en

  return {
    title: currentSeo.title,
    description: currentSeo.description,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      // Hreflang hrefs must be absolute (scheme + host) or search engines
      // will flag them as invalid, even though they resolve fine in-browser.
      languages: {
        en: `${SITE_URL}/en`,
        ar: `${SITE_URL}/ar`,
        ckb: `${SITE_URL}/ckb`,
        // x-default tells engines which version to fall back to when no
        // language/region matches the searcher — point it at your default locale.
        'x-default': `${SITE_URL}/en`,
      } as Record<string, string>,
    },
    icons: {
      icon: '/dima.ico',
      shortcut: '/dima.ico',
      apple: '/dima.ico',
    },
  }
}
