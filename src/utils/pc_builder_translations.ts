type LocaleText = Record<string, string>

export const clearAllLabel: LocaleText = {
  en: 'Clear All',
  ar: 'إلغاء الكل',
  ckb: 'پاشگەرزبوونەوە',
}

export const clearConfirmTitle: LocaleText = {
  en: 'Clear Current Build Selection',
  ar: 'مسح جميع القطع المختارة',
  ckb: 'پاشگەرزبوونەوە لە سەرجەم پارچەکان',
}

export const clearConfirmBody: LocaleText = {
  en: 'Are you sure you want to completely remove all components from your custom setup? This action cannot be undone.',
  ar: 'هل أنت متأكد من مسح جميع القطع التي قمت باختيارها؟ لا يمكن التراجع عن هذا الإجراء.',
  ckb: 'دڵنیای لە سڕینەوەی سەرجەم پارچەکان کە تا ئێستا هەڵت بژاردوون؟ ئەم کارە ناگەڕێتەوە دواوە.',
}

export const clearConfirmYes: LocaleText = {
  en: 'Yes, Clear All',
  ar: 'نعم، امسح الكل',
  ckb: 'بەڵێ، بسڕەوە',
}

export const clearConfirmCancel: LocaleText = {
  en: 'Cancel',
  ar: 'إلغاء',
  ckb: 'پاشگەزبوونەوە',
}

export const phoneAriaLabel: LocaleText = {
  en: 'Phone number',
  ar: 'رقم الهاتف',
  ckb: 'ژمارەی مۆبایل',
}

export const exchangeLabel: LocaleText = {
  en: 'Total Price (IQD)',
  ar: 'إجمالي السعر (IQD)',
  ckb: 'کۆی گشتی نرخ (IQD)',
}

export const cartSuccessMessage: LocaleText = {
  en: 'Product successfully added to your cart!',
  ar: 'تمت إضافة المنتج إلى السلة بنجاح!',
  ckb: 'بەسەرکەوتوویی زیادکرا بۆ سەبەتەکەت!',
}

// Not localized in the original component — kept as-is.
export const cartErrorMessage = 'Could not update shopping cart assets.'
export const emptySelectionAlert = 'Please select at least one component before ordering!'

export function pickLocale(dict: LocaleText, locale: string): string {
  return dict[locale] || dict.en
}
