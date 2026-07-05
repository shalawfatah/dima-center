type Locale = 'en' | 'ar' | 'ckb'

// Hardcoded fallback translations for a few product titles that aren't
// otherwise localized in the CMS data. Consider moving this into the
// main `dict` i18n structure if it grows further.
const fallbackCatalog: Record<string, Record<Locale, string>> = {
  'ئێم ئێس ئای پرۆ B760M-E DDR5': {
    en: 'MSI Pro B760M-E DDR5 Motherboard',
    ar: 'لوحة أم ام اس اي برو B760M-E DDR5',
    ckb: 'ئێم ئێس ئای پرۆ B760M-E DDR5',
  },
  'ئەی ئێم دی ڕادیۆن RX 7900 XTX': {
    en: 'AMD Radeon RX 7900 XTX Graphics Card',
    ar: 'کارت شاشة اي ام دي راديون RX 7900 XTX',
    ckb: 'ئەی ئێم دی ڕادیۆن RX 7900 XTX',
  },
  'پرۆسێسەری یاری RX 7800X3D': {
    en: 'AMD Ryzen 7 7800X3D Gaming Processor',
    ar: 'معالج الألعاب اي ام دي رايزن 7 7800X3D',
    ckb: 'پرۆسێسەری یاری RX 7800X3D',
  },
  'ئینتێل کۆر i9-14900K': {
    en: 'Intel Core i9-14900K Processor',
    ar: 'معالج إنتل كور i9-14900K',
    ckb: 'ئینتێل کۆر i9-14900K',
  },
  'ماکبوک پرۆ ١٦ ئینچ': {
    en: 'Apple MacBook Pro 16-inch (M4 Pro)',
    ar: 'ماكبوك برو ١٦ إنش',
    ckb: 'ماکبوک پرۆ ١٦ ئینچ',
  },
}

export function getLocalizedTitle(product: any, currentLocale: string): string {
  if (!product) return ''
  const rawTitle = product.title || ''
  if (fallbackCatalog[rawTitle]) {
    return fallbackCatalog[rawTitle][currentLocale as Locale] || rawTitle
  }
  return rawTitle
}

export function getExchangeLabel(currentLocale: string): string {
  if (currentLocale === 'ckb') return 'کۆی گشتی نرخ (IQD)'
  if (currentLocale === 'ar') return 'إجمالي السعر (IQD)'
  return 'Total Price (IQD)'
}

export function getProductImageUrl(item: any): string | undefined {
  return item?.featuredImage?.url || item?.meta?.image?.url
}
