import { RelatedProductsProps } from '@/types/types'
import RelatedProductCard from './RelatedProductCard'
import styles from '@/styles/product-detail.module.css'
import { headingLabel } from '@/utils/related_products_dict'

interface ExtendedRelatedProductsProps extends RelatedProductsProps {
  boxTitleColor?: string
  boxBodyColor?: string
  boxPriceColor?: string
  boxBgColor?: string
}

export default function RelatedProducts({
  items = [],
  currentLocale,
  isRtl,
  exchangeRate,
  cardBgColor,
  headingFont,
  bodyFont,
  dynamicFontFaceCSS,
  titleColor,
  bodyColor,
  borderColor,
  boxTitleColor,
  boxBodyColor,
  boxPriceColor,
  boxBgColor,
}: ExtendedRelatedProductsProps) {
  const safeItems = Array.isArray(items) ? items : []
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)
  const titleFont = headingFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')

  const headingColor = boxTitleColor || titleColor || '#000000'
  const textColor = boxBodyColor || bodyColor || '#333333'
  const resolvedBorderColor = borderColor || '#eee'
  const resolvedCardBg = boxBgColor || cardBgColor || '#f8fafc'

  return (
    <>
      {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}
      <div
        style={
          {
            marginTop: '6rem',
            borderTop: `1px solid ${resolvedBorderColor}`,
            paddingTop: '3rem',
            '--related-section-heading-color': headingColor,
            '--related-section-body-color': textColor,
          } as React.CSSProperties
        }
      >
        <h3
          style={{
            fontFamily: titleFont,
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--related-section-heading-color)',
          }}
        >
          {headingLabel[currentLocale] || headingLabel.en}
        </h3>
        {safeItems.length === 0 ? (
          <p
            style={{
              color: 'var(--related-section-body-color)',
              marginTop: '1rem',
              fontSize: '14px',
            }}
          >
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
                cardBgColor={resolvedCardBg}
                headingFont={headingFont}
                bodyFont={bodyFont}
                titleColor={headingColor}
                bodyColor={textColor}
                borderColor={resolvedBorderColor}
                boxTitleColor={boxTitleColor}
                boxBodyColor={boxBodyColor}
                boxPriceColor={boxPriceColor}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
