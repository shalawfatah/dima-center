export const BUILDS_DICT: Record<
  string,
  {
    title: string
    subtitle: string
    specs: string
    viewBuild: string
    emptyState: string
    priceLabel: string
    badgePre: string
    bringParts: string // 👈 Added localized key for button fallback if needed
  }
> = {
  en: {
    title: 'Pre-configured Masterpieces',
    subtitle:
      'Explore elite battle-tested gaming rigs and workstations assembled by our hardware experts.',
    specs: 'Specifications',
    viewBuild: 'View Configuration Blueprint',
    emptyState: 'No custom builds available in this segment yet.',
    priceLabel: 'Estimated Value',
    badgePre: 'Expert Build',
    bringParts: 'Customize in Builder',
  },
  ar: {
    title: 'تحف فنية مسبقة الصنع',
    subtitle:
      'استكشف أجهزة الألعاب ومحطات العمل النخبوية المجربة والمعتمدة من قبل خبراء العتاد لدينا.',
    specs: 'المواصفات والقطع',
    viewBuild: 'عرض مخطط التجميعة',
    emptyState: 'لا توجد تجميعات مخصصة متاحة حاليًا.',
    priceLabel: 'القيمة التقديرية',
    badgePre: 'تجميعة خبراء',
    bringParts: 'تعديل التجميعة',
  },
  ckb: {
    title: 'ڕێکخستنە ئامادەکراوە بێهاوتاکان',
    subtitle:
      'تەماشای بەهێزترین کیسەکانی یاریکردن و کارکردن بکە کە لەلایەن شارەزایانمانەوە تاقیکراونەتەوە.',
    specs: 'مۆدیل و پارچەکان',
    viewBuild: 'سەیرکردنی پلانی بیڵدەکە',
    emptyState: 'هیچ بیڵدێکی ئامادەکراو لە ئێستادا بەردەست نییە.',
    priceLabel: 'نرخی خەمڵێندراو',
    badgePre: 'بیڵدی تایبەت',
    bringParts: 'دەستکاری بیڵد بکە',
  },
}
