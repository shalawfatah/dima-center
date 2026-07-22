import RelatedProductCard from './RelatedProductCard'
import styles from '@/styles/product-detail.module.css'

const headingLabel: Record<string, string> = {
  ar: 'منتجات مشابهة قد تعجبك',
  ckb: 'کاڵای هاوشێوە کە بەدڵت دەبێت',
  en: 'More Products You Might Like',
}

interface RelatedProductsProps {
  items?: any[] // Optional to prevent TS complaints if undefined is passed
  currentLocale: string
  isRtl: boolean
  exchangeRate: number
}

export default function RelatedProducts({
  items = [], // Default to an empty array
  currentLocale,
  isRtl,
  exchangeRate,
}: RelatedProductsProps) {
  // Ensure we always work with a valid array
  const safeItems = Array.isArray(items) ? items : []

  return (
    <div style={{ marginTop: '6rem', borderTop: '1px solid #eee', paddingTop: '3rem' }}>
      <h3
        style={{
          fontFamily: '"Rudaw", sans-serif',
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1e293b',
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
          {safeItems.map((item) => (
            <RelatedProductCard
              key={item?.id ?? Math.random()}
              item={item}
              currentLocale={currentLocale}
              isRtl={isRtl}
              exchangeRate={exchangeRate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
