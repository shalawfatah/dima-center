import { formatCurrency } from './formatCurrency'

interface ProductPriceDisplayProps {
  variant: 'detail' | 'card'
  finalPrice: number
  originalPrice: number
  isDiscounted: boolean
  iqdPrice: number
  currentLocale: string
  isRtl?: boolean
}

export default function ProductPriceDisplay({
  variant,
  finalPrice,
  originalPrice,
  isDiscounted,
  iqdPrice,
  currentLocale,
  isRtl,
}: ProductPriceDisplayProps) {
  if (variant === 'detail') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <div
          style={{
            backgroundColor: '#F3F3F3',
            color: '#334155',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: '700',
            fontFamily: isRtl ? '"Rudaw", sans-serif' : 'inherit',
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
                color: '#94a3b8',
                fontWeight: '500',
              }}
            >
              {formatCurrency(originalPrice, currentLocale)}
            </span>
            <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ef4444' }}>
              {formatCurrency(finalPrice, currentLocale)}
            </span>
          </>
        ) : (
          <span style={{ fontSize: '2.25rem', fontWeight: '800', color: '#000' }}>
            {formatCurrency(finalPrice, currentLocale)}
          </span>
        )}
      </div>
    )
  }

  // 'card' variant — compact pricing used in related product grid items
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
        {formatCurrency(iqdPrice, currentLocale, true)}
      </span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
        {isDiscounted ? (
          <>
            <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#ef4444' }}>
              {formatCurrency(finalPrice, currentLocale)}
            </span>
            <span style={{ fontSize: '11px', textDecoration: 'line-through', color: '#94a3b8' }}>
              {formatCurrency(originalPrice, currentLocale)}
            </span>
          </>
        ) : (
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
            {formatCurrency(finalPrice, currentLocale)}
          </span>
        )}
      </div>
    </div>
  )
}
