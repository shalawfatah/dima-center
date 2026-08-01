import RelatedProductCard from './RelatedProductCard'
import styles from '@/styles/product-detail.module.css'

const headingLabel: Record<string, string> = {
  ar: 'منتجات مشابهة قد تعجبك',
  ckb: 'کاڵای هاوشێوە کە بەدڵت دەبێت',
  en: 'More Products You Might Like',
}

interface RelatedProductsProps {
  items?: any[]
  currentLocale: string
  isRtl: boolean
  exchangeRate: number
  cardBgColor?: string
}

export default function RelatedProducts({
  items = [],
  currentLocale,
  isRtl,
  exchangeRate,
  cardBgColor,
}: RelatedProductsProps) {
  const safeItems = Array.isArray(items) ? items : []

  return (
    <div style={{ marginTop: '6rem', borderTop: '1px solid #eee', paddingTop: '3rem' }}>
      <h3
        style={{
          fontFamily: '"Rudaw", sans-serif',
          fontSize: '1.5rem',
          fontWeight: '600',
        }}
      >
        {headingLabel[currentLocale] || headingLabel.en}
      </h3>

      {safeItems.length === 0 ? (
        <p style={{ color: '#888', marginTop: '1rem', fontSize: '14px' }}>
          No related components inside this section yet.
        </p>
      ) : (
        <div className={styles['related-grid']}>
          {safeItems.map((item, index) => (
            <RelatedProductCard
              key={item?.id ?? `related-${index}`}
              item={item}
              currentLocale={currentLocale}
              isRtl={isRtl}
              exchangeRate={exchangeRate}
              cardBgColor={cardBgColor}
            />
          ))}
        </div>
      )}
    </div>
  )
}
