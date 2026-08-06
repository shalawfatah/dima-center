import { RelatedProductsProps } from '@/types/types'
import RelatedProductCard from './RelatedProductCard'
import styles from '@/styles/product-detail.module.css'
import { headingLabel } from '@/utils/related_products_dict'

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
}: RelatedProductsProps) {
  const safeItems = Array.isArray(items) ? items : []
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)
  const titleFont = headingFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')

  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'
  const resolvedBorderColor = borderColor || '#eee'

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
                cardBgColor={cardBgColor}
                headingFont={headingFont}
                bodyFont={bodyFont}
                titleColor={titleColor}
                bodyColor={bodyColor}
                borderColor={borderColor}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
