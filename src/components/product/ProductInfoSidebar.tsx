import ProductBuyActions from '@/components/cart/ProductBuyActions'
import ProductPriceDisplay from './ProductPriceDisplay'
import {
  conditionLabels,
  quantityLabel,
  stockStatusLabel,
  totalLabel,
} from '@/utils/single_page_dicts'

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
  cardBgColor?: string
  headingFont?: string
  bodyFont?: string
  dynamicFontFaceCSS?: string
  titleColor?: string
  bodyColor?: string
  borderColor?: string
}

export default function ProductInfoSidebar({
  product,
  currentLocale,
  isRtl,
  finalPrice,
  originalPrice,
  isDiscounted,
  iqdPrice,
  cardBgColor,
  headingFont,
  bodyFont,
  dynamicFontFaceCSS,
  titleColor,
  bodyColor,
  borderColor,
}: ProductInfoSidebarProps) {
  const realIqdPrice =
    product.priceIQD !== null && product.priceIQD !== undefined && Number(product.priceIQD) > 0
      ? Number(product.priceIQD)
      : iqdPrice

  const conditionText =
    conditionLabels[product.condition]?.[currentLocale] ||
    conditionLabels[product.condition]?.en ||
    product.condition

  const resolvedBg = cardBgColor || '#ffffff'
  const resolvedBorderColor = borderColor || '#eef0f2'

  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)
  const titleFont = headingFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')
  const bodyFontFamily = bodyFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')

  // Use provided colors or fallbacks
  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'

  return (
    <>
      {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}

      <div
        style={
          {
            border: `1px solid ${resolvedBorderColor}`,
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            background: resolvedBg,
            position: 'sticky',
            top: '20px',
            '--sidebar-heading-font': titleFont,
            '--sidebar-body-font': bodyFontFamily,
            '--sidebar-heading-color': headingColor,
            '--sidebar-body-color': textColor,
          } as React.CSSProperties
        }
      >
        {/* Upper Content Block */}
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
              fontFamily: 'var(--sidebar-heading-font)',
              color: 'var(--sidebar-heading-color)',
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
                color: 'var(--sidebar-body-color)',
                lineHeight: '1.6',
                margin: '0',
                fontFamily: 'var(--sidebar-body-font)',
              }}
            >
              {product.description}
            </p>
          )}
        </div>

        <div style={{ borderTop: `1px solid ${resolvedBorderColor}`, paddingTop: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{ color: 'var(--sidebar-body-color)', fontFamily: 'var(--sidebar-body-font)' }}
            >
              {stockStatusLabel[currentLocale] || stockStatusLabel.en}
            </span>
            <span
              style={{
                fontWeight: 'bold',
                color: product.stock > 0 ? '#16a34a' : '#dc2626',
                fontFamily: 'var(--sidebar-body-font)',
              }}
            >
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
              <label
                style={{
                  color: 'var(--sidebar-body-color)',
                  fontFamily: 'var(--sidebar-body-font)',
                }}
              >
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
                  border: `1px solid ${resolvedBorderColor}`,
                  fontSize: '16px',
                  textAlign: 'center',
                  fontFamily: 'var(--sidebar-body-font)',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: `1px solid ${resolvedBorderColor}`,
                paddingTop: '1.5rem',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  color: 'var(--sidebar-heading-color)',
                  fontWeight: 'bold',
                  fontFamily: 'var(--sidebar-heading-font)',
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
                headingFont={headingFont}
                bodyFont={bodyFont}
                titleColor={titleColor}
                bodyColor={bodyColor}
              />
            </div>

            <ProductBuyActions
              product={product}
              finalPrice={finalPrice}
              iqdPrice={realIqdPrice}
              currentLocale={currentLocale}
              bodyFont={bodyFont}
              bodyColor={bodyColor}
            />
          </div>
        </div>
      </div>
    </>
  )
}
