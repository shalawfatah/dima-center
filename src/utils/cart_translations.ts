interface TranslationBundle {
  title: string
  empty: string
  continue: string
  summary: string
  subtotal: string
  currency: string
  clear: string
  checkout: string
  phonePlaceholder: string
  phoneError: string
}

export const translations: Record<'en' | 'ar' | 'ckb', TranslationBundle> = {
  en: {
    title: 'Your Shopping Cart',
    empty: 'Your cart is completely empty.',
    continue: 'Continue Shopping',
    summary: 'Order Summary',
    subtotal: 'Total Amount',
    currency: 'USD',
    clear: 'Clear Cart',
    checkout: 'Order via WhatsApp 🛒',
    phonePlaceholder: 'Enter your WhatsApp number (e.g. 07701234567)',
    phoneError: 'Please enter your WhatsApp number to complete the order!',
  },
  ar: {
    title: 'حقيبة التسوق الخاصة بك',
    empty: 'حقيبة التسوق فارغة تماماً.',
    continue: 'متابعة التسوق',
    summary: 'ملخص الطلب',
    subtotal: 'المجموع الكلي',
    currency: 'دۆلار',
    clear: 'تفريغ السلة',
    checkout: 'اطلب عبر واتساب 🛒',
    phonePlaceholder: 'أدخل رقم الواتساب الخاص بك (مثال: 07701234567)',
    phoneError: 'يرجى إدخال رقم هاتف الواتساب الخاص بك لإرسال الطلب!',
  },
  ckb: {
    title: 'سەبەتەی کڕینەکەت',
    empty: 'سەبەتەکەت چۆڵە.',
    continue: 'بەردەوامبوون لە کڕین',
    summary: 'پوختەی داواکاری',
    subtotal: 'کۆ گشتی',
    currency: 'دۆلار',
    clear: 'سڕینەوەی سەبەتە',
    checkout: 'داواکردن لە ڕێگەی واتسئەپ 🛒',
    phonePlaceholder: 'ژمارەی واتسئەپەکەت بنووسە (نموونە: 07701234567)',
    phoneError: 'تکایە ژمارەی واتسئەپەکەت بنووسە بۆ ناردنی داواکارییەکە!',
  },
}
