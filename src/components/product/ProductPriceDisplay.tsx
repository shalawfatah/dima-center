import { ProductPriceDisplayProps } from '@/types/types'
import { formatCurrency } from './formatCurrency'

interface ExtendedProductPriceDisplayProps extends ProductPriceDisplayProps {
  priceColor?: string
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
  priceColor,
}: ExtendedProductPriceDisplayProps) {
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)
  const titleFont = headingFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')
  const bodyFontFamily = bodyFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')

  // Use provided colors or fallbacks
  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'
  const resolvedPriceColor = priceColor || textColor

  if (variant === 'detail') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <div
          style={{
            color: resolvedPriceColor,
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
                color: resolvedPriceColor,
                fontWeight: '500',
                fontFamily: bodyFontFamily,
                opacity: 0.8,
              }}
            >
              {formatCurrency(originalPrice, currentLocale)}
            </span>
            <span
              style={{
                fontSize: '2.25rem',
                fontWeight: '800',
                color: resolvedPriceColor,
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
              color: resolvedPriceColor,
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
          color: resolvedPriceColor,
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
                color: resolvedPriceColor,
                fontFamily: titleFont,
              }}
            >
              {formatCurrency(finalPrice, currentLocale)}
            </span>
            <span
              style={{
                fontSize: '11px',
                textDecoration: 'line-through',
                color: resolvedPriceColor,
                fontFamily: bodyFontFamily,
                opacity: 0.8,
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
