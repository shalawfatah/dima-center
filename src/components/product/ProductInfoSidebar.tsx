import ProductBuyActions from '@/components/cart/ProductBuyActions'
import ProductPriceDisplay from './ProductPriceDisplay'
import {
  conditionLabels,
  quantityLabel,
  stockStatusLabel,
  totalLabel,
} from '@/utils/single_page_dicts'
import { ProductInfoSidebarProps } from '@/types/types'

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
  boxTitleColor,
  boxBodyColor,
  boxPriceColor,
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

  // Explicit mapping for Box typography overrides
  const headingColor = boxTitleColor || titleColor || '#000000'
  const textColor = boxBodyColor || bodyColor || '#333333'
  const priceColor = boxPriceColor || textColor

  // Check if product is part of 'case-offers'
  const categorySlug =
    typeof product?.category === 'object' && product?.category !== null
      ? product.category.slug
      : typeof product?.category === 'string'
        ? product.category
        : ''

  const isCaseOffer = Boolean(product.isCaseOffer) || categorySlug === 'case-offers'

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
            '--sidebar-price-color': priceColor,
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
          {/* Hide stock status row ONLY for case-offers */}
          {!isCaseOffer && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <span
                style={{
                  color: 'var(--sidebar-body-color)',
                  fontFamily: 'var(--sidebar-body-font)',
                }}
              >
                {stockStatusLabel[currentLocale] || stockStatusLabel.en}
              </span>
              <span
                style={{
                  fontWeight: 'bold',
                  color: 'var(--sidebar-body-color)',
                  fontFamily: 'var(--sidebar-body-font)',
                }}
              >
                {getStockText(product.stock, currentLocale)}
              </span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Quantity selector is preserved for normal products, hidden only for case-offers */}
            {!isCaseOffer && (
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
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
                    color: 'var(--sidebar-body-color)',
                    backgroundColor: 'transparent',
                  }}
                />
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: isCaseOffer ? 'none' : `1px solid ${resolvedBorderColor}`,
                paddingTop: isCaseOffer ? '0' : '1.5rem',
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
                titleColor={headingColor}
                bodyColor={priceColor}
              />
            </div>

            <ProductBuyActions
              product={product}
              finalPrice={finalPrice}
              iqdPrice={realIqdPrice}
              currentLocale={currentLocale}
              bodyFont={bodyFont}
              bodyColor={textColor}
            />
          </div>
        </div>
      </div>
    </>
  )
}
