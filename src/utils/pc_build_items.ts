export const COMPONENT_SLOTS = [
  { key: 'cpu', label: 'Processor (CPU)', categorySlug: 'cpu' },
  { key: 'gpu', label: 'Graphics Card (GPU)', categorySlug: 'gpu' },
  { key: 'motherboard', label: 'Motherboard', categorySlug: 'motherboard' },
  { key: 'ram', label: 'Memory (RAM)', categorySlug: 'ram' },
  { key: 'storage', label: 'Storage (SSD/HDD)', categorySlug: 'storage' },
  { key: 'psu', label: 'Power Supply (PSU)', categorySlug: 'power-supply' },
  { key: 'case', label: 'Chassis / Case', categorySlug: 'case' },
  { key: 'cooler', label: 'CPU Cooler', categorySlug: 'cooler' },
]

export const dict: Record<string, Record<string, string>> = {
  en: {
    title: 'Build Your Dream PC',
    subtitle:
      'Mix and match components to build your custom desktop configuration. Progress is auto-saved locally!',
    noPart: 'No part selected',
    clear: 'Clear',
    change: 'Change',
    choose: 'Choose Part',
    summary: 'Configuration Summary',
    configName: 'Configuration Name',
    totalPrice: 'Total Price:',
    saving: 'Saving Blueprint...',
    saveBtn: 'Save Configuration',
    partLabel: 'PART',
    noItems: 'No items found under category',
    loginPrompt: '💡 Want to save this layout?',
    signIn: 'Sign in',
    saveSuffix: 'to save blueprints.',
    modalSelectPrefix: 'Select',
  },
  ckb: {
    title: 'کۆمپیوتەری خەونەکانت دروست بکە',
    subtitle:
      'پارچەکان تێکەڵ بکە و بگونجێنە بۆ دروستکردنی کۆمپیوتەرەکەت. پێشکەوتنەکان خۆکارانە پاشەکەوت دەبن!',
    noPart: 'هیچ پارچەیەک دیاری نەکراوە',
    clear: 'سڕینەوە',
    change: 'گۆڕین',
    choose: 'دیاریکردنی پارچە',
    summary: 'کورتەی پێکهاتەکان',
    configName: 'ناوی پێکهاتەکە',
    totalPrice: 'کۆی گشتی نرخ:',
    saving: 'پاشەکەوتکردنی نەخشە...',
    saveBtn: 'پاشەکەوتکردنی پێکهاتە',
    partLabel: 'پارچە',
    noItems: 'هیچ بڕگەیەک نەدۆزرایەوە لەژێر ئەم هاوپۆلەدا',
    loginPrompt: '💡 دەتەوێت ئەم نەخشەیە پاشەکەوت بکەیت؟',
    signIn: 'چوونەژوورەوە',
    saveSuffix: 'بۆ پاشەکەوتکردنی نەخشەکان.',
    modalSelectPrefix: 'دیاریکردنی',
  },
  ar: {
    title: 'ابنِ جهاز الكمبيوتر الأحلام',
    subtitle: 'قم بمطابقة المكونات لبناء جهاز الكمبيوتر المخصص لك. يتم حفظ التقدم تلقائيًا محليًا!',
    noPart: 'لم يتم اختيار أي قطعة',
    clear: 'مسح',
    change: 'تغيير',
    choose: 'اختر قطعة',
    summary: 'ملخص التجميعة',
    configName: 'اسم التجميعة',
    totalPrice: 'السعر الإجمالي:',
    saving: 'جاري حفظ المخطط...',
    saveBtn: 'حفظ التجميعة',
    partLabel: 'قطعة',
    noItems: 'لم يتم العثور على عناصر تحت هذه الفئة',
    loginPrompt: '💡 هل تريد حفظ هذا المخطط؟',
    signIn: 'تسجيل الدخول',
    saveSuffix: 'لحفظ المخططات.',
    modalSelectPrefix: 'اختر',
  },
}

export interface PcBuilderClientProps {
  products: any[]
  user: any | null
  currentLocale: string
  isRtl: boolean
}
