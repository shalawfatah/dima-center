import { exchangeLabel, phoneAriaLabel, pickLocale } from '@/utils/pc_builder_translations'
import { submitLabel, whatsappPriceNotice } from '@/utils/pc_build_items'
import styles from '@/styles/pc_builder.module.css'
import { BuildSummarySidebarProps } from '@/types/types'

export default function BuildSummarySidebar({
  t,
  currentLocale,
  mounted,
  totalPrice,
  totalOriginalPrice,
  dynamicExchangeRate,
  buyerNumber,
  setBuyerNumber,
  hasSelections,
  onSubmit,
  fontFam,
  titleColor,
  bodyColor,
  boxTitleColor,
  boxBodyColor,
  boxPriceColor,
  boxBgColor,
  borderColor,
}: BuildSummarySidebarProps) {
  const submitDisabled = !mounted || !hasSelections

  const headingColor = boxTitleColor || titleColor || '#000000'
  const textColor = boxBodyColor || bodyColor || '#333333'
  const priceColor = boxPriceColor || textColor
  const resolvedBoxBg = boxBgColor || '#ffffff'
  const resolvedBorderColor = borderColor || '#e2e8f0'

  return (
    <div className={styles['pc-builder-sidebar']}>
      <div
        className={styles['pc-builder-summary-card']}
        style={{
          backgroundColor: resolvedBoxBg,
          borderColor: resolvedBorderColor,
        }}
      >
        <h3
          className={styles['pc-builder-summary-heading']}
          style={{
            color: headingColor,
            fontFamily: fontFam,
          }}
        >
          {t.summary}
        </h3>

        <div
          className={styles['pc-builder-price-row']}
          style={{
            borderColor: resolvedBorderColor,
            backgroundColor: 'transparent',
            borderTop: 'none',
            paddingTop: 0,
          }}
        >
          <span
            className={styles['pc-builder-price-label']}
            style={{
              color: textColor,
              fontFamily: fontFam,
            }}
          >
            {pickLocale(exchangeLabel, currentLocale)}
          </span>
          <div className={styles['pc-builder-total-price-wrap']}>
            <span
              className={styles['pc-builder-price-value']}
              style={{
                color: priceColor,
                fontFamily: fontFam,
              }}
            >
              {(totalPrice * dynamicExchangeRate).toLocaleString()} د.ع
            </span>
          </div>
        </div>

        <div
          className={styles['pc-builder-price-row']}
          style={{
            borderTopColor: resolvedBorderColor,
            fontFamily: fontFam,
          }}
        >
          <span
            className={styles['pc-builder-price-label']}
            style={{
              color: textColor,
              fontFamily: fontFam,
            }}
          >
            {t.totalPrice}
          </span>
          <div className={styles['pc-builder-total-price-wrap']}>
            {totalOriginalPrice > totalPrice && (
              <span
                className={styles['pc-builder-total-original']}
                style={{
                  color: priceColor,
                  opacity: 0.8,
                  fontFamily: fontFam,
                }}
              >
                ${totalOriginalPrice.toLocaleString()}
              </span>
            )}
            <span
              className={styles['pc-builder-price-value']}
              style={{
                color: priceColor,
                fontFamily: fontFam,
              }}
            >
              ${totalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        <div className={styles['pc-builder-whatsapp-notice']}>
          ℹ️ {whatsappPriceNotice[currentLocale] || whatsappPriceNotice.en}
        </div>

        <form onSubmit={onSubmit} className={styles['pc-builder-order-form']}>
          <input
            type="tel"
            value={buyerNumber}
            onChange={(e) => setBuyerNumber(e.target.value)}
            required
            className={styles['pc-builder-phone-input']}
            aria-label={pickLocale(phoneAriaLabel, currentLocale)}
            style={{
              color: textColor,
              borderColor: resolvedBorderColor,
              backgroundColor: resolvedBoxBg,
            }}
            placeholder={t.phonePlaceholder || 'Phone Number'}
          />
          <button
            type="submit"
            disabled={submitDisabled}
            className={`${styles['pc-builder-submit-btn']} ${submitDisabled ? styles.disabled : ''}`}
            style={{
              fontFamily: fontFam,
              color: submitDisabled ? textColor : '#000',
              backgroundColor: submitDisabled ? resolvedBorderColor : '#25d366',
            }}
          >
            {submitLabel[currentLocale] || submitLabel.en}
          </button>
        </form>
      </div>
    </div>
  )
}
