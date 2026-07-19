import RelatedProductCard from './RelatedProductCard'
import styles from '@/styles/product-detail.module.css'

const headingLabel: Record<string, string> = {
  ar: 'منتجات مشابهة قد تعجبك',
  ckb: 'کاڵای هاوشێوە کە بەدڵت دەبێت',
  en: 'More Products You Might Like',
}

interface RelatedProductsProps {
  items: any[]
  currentLocale: string
  isRtl: boolean
  exchangeRate: number
  basePath?: string // 1. Added optional prop here
}

export default function RelatedProducts({
  items,
  currentLocale,
  isRtl,
  exchangeRate,
  basePath = 'products', // 2. Defaulting to 'products' to avoid breaking current usage
}: RelatedProductsProps) {
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

      {items.length === 0 ? (
        <p style={{ color: '#888', marginTop: '1rem', fontSize: '14px' }}>
          No related components inside this section yet.
        </p>
      ) : (
        <div className={styles['related-grid']}>
          {items.map((item) => (
            <RelatedProductCard
              key={item.id}
              item={item}
              currentLocale={currentLocale}
              isRtl={isRtl}
              exchangeRate={exchangeRate}
              basePath={basePath} // 3. Forward the prop to the card
            />
          ))}
        </div>
      )}
    </div>
  )
}
