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

const conditionLabels: Record<string, Record<string, string>> = {
  new: { en: 'New', ckb: 'نوێ', ar: 'جديد' },
  used: { en: 'Used', ckb: 'بەکارهاتوو', ar: 'مستعمل' },
  refurbished: { en: 'Refurbished', ckb: 'نوێکراوەتەوە', ar: 'مجدد' },
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
  const realIqdPrice =
    product.priceIQD !== null && product.priceIQD !== undefined && Number(product.priceIQD) > 0
      ? Number(product.priceIQD)
      : iqdPrice

  const conditionText =
    conditionLabels[product.condition]?.[currentLocale] ||
    conditionLabels[product.condition]?.en ||
    product.condition

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
      {/* 🎯 Restored Upper Content Block */}
      <div style={{ marginBottom: '1.5rem' }}>
        {product.condition && (
          <span
            style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              background: product.condition === 'new' ? '#e8f5e9' : '#fff3e0',
              color: product.condition === 'new' ? '#2e7d32' : '#ef6c00',
              marginBottom: '0.75rem',
            }}
          >
            {conditionText}
          </span>
        )}

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            fontFamily: 'Rudaw',
            margin: '0 0 0.5rem 0',
            lineHeight: '1.3',
          }}
        >
          {product.title}
        </h1>

        {product.description && (
          <p
            style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.6',
              margin: '0',
            }}
          >
            {product.description}
          </p>
        )}
      </div>

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

        <div
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
            iqdPrice={realIqdPrice}
            currentLocale={currentLocale}
          />
        </div>
      </div>
    </div>
  )
}
