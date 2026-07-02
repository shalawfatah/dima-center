import type { Metadata } from 'next'

interface SeoParams {
  locale: string
}

export async function getStorefrontMetadata(params: SeoParams): Promise<Metadata> {
  const locale = params.locale || 'en'

  const seo = {
    en: {
      title: 'Dima Hardware | Premium PC Components Shop',
      description:
        'Find high-performance CPUs, Graphics Cards, Motherboards, and gaming accessories in Iraq. Great prices and reliable hardware.',
    },
    ar: {
      title: 'ديما هاردوير | متجر قطع ومكونات الكمبيوتر',
      description:
        'اكتشف أفضل قطع الكمبيوتر في العراق: معالجات، كروت شاشة، لوحات أم، وإكسسوارات جيمنج بأفضل الأسعار.',
    },
    ckb: {
      title: 'دیما هاردوێر | فرۆشگای پارچە و پێکهاتەکانی کۆمپیوتەر',
      description:
        'باشترین پارچەکانی کۆمپیوتەر لە عێراق بەدەستبهێنە: پڕۆسێسەر، کارتی شاشە، مازەربۆرد و ئێکسسواراتی یاریکردن بە گونجاوترین نرخ.',
    },
  }

  const currentSeo = seo[locale as 'en' | 'ar' | 'ckb'] || seo.en

  return {
    title: currentSeo.title,
    description: currentSeo.description,
    alternates: {
      // 🎯 Fixed: Cast the languages object to allow string indexing for non-standard ISO macro-tags
      languages: {
        en: '/en',
        ar: '/ar',
        ckb: '/ckb',
      } as Record<string, string>,
    },
    icons: {
      icon: '/dima.ico',
      shortcut: '/dima.ico',
      apple: '/dima.ico',
    },
  }
}
