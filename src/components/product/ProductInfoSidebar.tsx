import ProductBuyActions from '@/components/cart/ProductBuyActions'
import ProductPriceDisplay from './ProductPriceDisplay'

const quantityLabel: Record<string, string> = {
  ar: 'الكمية',
  ckb: 'بڕ',
  en: 'Quantity',
}

const stockStatusLabel: Record<string, string> = {
  ar: 'حالة المخزون',
  ckb: 'بڕی بەردەست',
  en: 'Stock Status',
}

const totalLabel: Record<string, string> = {
  ar: 'المجموع الكلي:',
  ckb: 'کۆی گشتی:',
  en: 'Total Amount:',
}

function getStockText(stock: number, currentLocale: string) {
  if (stock > 0) {
    if (currentLocale === 'ar') return `متوفر (${stock} قطع)`
    if (currentLocale === 'ckb') return `بەردەستە (${stock} دانە)`
    return `In Stock (${stock} items)`
  }
  if (currentLocale === 'ar') return 'غير متوفر'
  if (currentLocale === 'ckb') return 'بڕاوە'
  return 'Out of Stock'
}

interface ProductInfoSidebarProps {
  product: any
  currentLocale: string
  isRtl: boolean
  finalPrice: number
  originalPrice: number
  isDiscounted: boolean
  iqdPrice: number
}

export default function ProductInfoSidebar({
  product,
  currentLocale,
  isRtl,
  finalPrice,
  originalPrice,
  isDiscounted,
  iqdPrice,
}: ProductInfoSidebarProps) {
  // Prefer the product's real, synced priceIQD (direct from Bruska) over the
  // computed/derived iqdPrice — only fall back to iqdPrice when priceIQD is
  // missing or 0.
  const realIqdPrice =
    product.priceIQD !== null && product.priceIQD !== undefined && Number(product.priceIQD) > 0
      ? Number(product.priceIQD)
      : iqdPrice

  return (
    <div
      style={{
        border: '1px solid #eef0f2',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        background: '#fff',
        position: 'sticky',
        top: '20px',
      }}
    >
      <span
        style={{
          fontSize: '12px',
          background: '#e0f2fe',
          color: '#0369a1',
          padding: '4px 8px',
          borderRadius: '4px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}
      >
        {product.condition?.replace('_', ' ')}
      </span>

      <h1
        style={{
          fontFamily: '"Rudaw", sans-serif',
          color: '#1e293b',
          fontSize: '2rem',
          marginTop: '1rem',
          marginBottom: '0.5rem',
          fontWeight: '700',
          lineHeight: '1.2',
        }}
      >
        {product.title}
      </h1>
      <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.6', marginBottom: '2rem' }}>
        {product.description}
      </p>

      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <span style={{ color: '#666' }}>
            {stockStatusLabel[currentLocale] || stockStatusLabel.en}
          </span>
          <span style={{ fontWeight: 'bold', color: product.stock > 0 ? '#16a34a' : '#dc2626' }}>
            {getStockText(product.stock, currentLocale)}
          </span>
        </div>

        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ color: '#666' }}>
              {quantityLabel[currentLocale] || quantityLabel.en}
            </label>
            <input
              type="number"
              id="qty-counter"
              defaultValue="1"
              min="1"
              max={product.stock}
              style={{
                width: '70px',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '16px',
                textAlign: 'center',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #f0f0f0',
              paddingTop: '1.5rem',
            }}
          >
            <span
              style={{
                fontSize: '16px',
                color: '#444',
                fontWeight: 'bold',
                fontFamily: 'Rudaw',
              }}
            >
              {totalLabel[currentLocale] || totalLabel.en}
            </span>

            <ProductPriceDisplay
              variant="detail"
              finalPrice={finalPrice}
              originalPrice={originalPrice}
              isDiscounted={isDiscounted}
              iqdPrice={realIqdPrice}
              currentLocale={currentLocale}
              isRtl={isRtl}
            />
          </div>

          <ProductBuyActions
            product={product}
            finalPrice={finalPrice}
            originalPrice={originalPrice}
            isDiscounted={isDiscounted}
            currentLocale={currentLocale}
          />
        </form>
      </div>
    </div>
  )
}
