export function formatCurrency(amount: number, locale: string, isIqd = false) {
  if (isIqd) {
    const formattedNumber = new Intl.NumberFormat('en-US').format(Math.round(amount))
    const suffix = locale === 'en' ? 'IQD' : 'د.ع'
    // For RTL layouts, placing suffix explicitly handles font rendering nicely
    return `${formattedNumber} ${suffix}`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}
