import { formatCurrency } from './formatCurrency'

interface ProductPriceDisplayProps {
  variant: 'detail' | 'card'
  finalPrice: number
  originalPrice: number
  isDiscounted: boolean
  iqdPrice: number
  currentLocale: string
  isRtl?: boolean
  headingFont?: string
  bodyFont?: string
  titleColor?: string
  bodyColor?: string
}

export default function ProductPriceDisplay({
  variant,
  finalPrice,
  originalPrice,
  isDiscounted,
  iqdPrice,
  currentLocale,
  headingFont,
  bodyFont,
  titleColor,
  bodyColor,
}: ProductPriceDisplayProps) {
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)
  const titleFont = headingFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')
  const bodyFontFamily = bodyFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')

  // Use provided colors or fallbacks
  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'

  if (variant === 'detail') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <div
          style={{
            backgroundColor: '#F3F3F3',
            color: textColor,
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: '700',
            fontFamily: bodyFontFamily,
          }}
        >
          {formatCurrency(iqdPrice, currentLocale, true)}
        </div>

        {isDiscounted ? (
          <>
            <span
              style={{
                fontSize: '14px',
                textDecoration: 'line-through',
                color: textColor,
                fontWeight: '500',
                fontFamily: bodyFontFamily,
              }}
            >
              {formatCurrency(originalPrice, currentLocale)}
            </span>
            <span
              style={{
                fontSize: '2.25rem',
                fontWeight: '800',
                color: '#ef4444',
                fontFamily: titleFont,
              }}
            >
              {formatCurrency(finalPrice, currentLocale)}
            </span>
          </>
        ) : (
          <span
            style={{
              fontSize: '2.25rem',
              fontWeight: '800',
              color: headingColor,
              fontFamily: titleFont,
            }}
          >
            {formatCurrency(finalPrice, currentLocale)}
          </span>
        )}
      </div>
    )
  }

  // 'card' variant — compact pricing used in related product grid items
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span
        style={{
          fontSize: '12px',
          color: textColor,
          fontWeight: '600',
          fontFamily: bodyFontFamily,
        }}
      >
        {formatCurrency(iqdPrice, currentLocale, true)}
      </span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
        {isDiscounted ? (
          <>
            <span
              style={{
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#ef4444',
                fontFamily: titleFont,
              }}
            >
              {formatCurrency(finalPrice, currentLocale)}
            </span>
            <span
              style={{
                fontSize: '11px',
                textDecoration: 'line-through',
                color: textColor,
                fontFamily: bodyFontFamily,
              }}
            >
              {formatCurrency(originalPrice, currentLocale)}
            </span>
          </>
        ) : (
          <span
            style={{
              fontWeight: 'bold',
              fontSize: '15px',
              color: headingColor,
              fontFamily: titleFont,
            }}
          >
            {formatCurrency(finalPrice, currentLocale)}
          </span>
        )}
      </div>
    </div>
  )
}
