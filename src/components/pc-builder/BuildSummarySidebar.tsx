import React from 'react'
import { exchangeLabel, phoneAriaLabel, pickLocale } from '@/utils/pc_builder_translations'
import { submitLabel, whatsappPriceNotice } from '@/utils/pc_build_items'
import styles from '@/styles/pc_builder.module.css'

interface BuildSummarySidebarProps {
  t: Record<string, string>
  currentLocale: string
  mounted: boolean
  totalPrice: number
  totalOriginalPrice: number
  dynamicExchangeRate: number
  buyerNumber: string
  setBuyerNumber: (value: string) => void
  hasSelections: boolean
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
  fontFam: string
  titleColor?: string
  bodyColor?: string
  boxBgColor?: string
  borderColor?: string
}

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
  boxBgColor,
  borderColor,
}: BuildSummarySidebarProps) {
  const submitDisabled = !mounted || !hasSelections
  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'
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
          className={styles['pc-builder-exchange-container']}
          style={{
            borderColor: resolvedBorderColor,
            backgroundColor: 'transparent',
          }}
        >
          <span
            className={styles['pc-builder-exchange-label']}
            style={{ color: textColor, backgroundColor: 'transparent' }}
          >
            {pickLocale(exchangeLabel, currentLocale)}
          </span>
          <span
            className={styles['pc-builder-exchange-value']}
            style={{ color: headingColor, backgroundColor: 'transparent' }}
          >
            {(totalPrice * dynamicExchangeRate).toLocaleString()} د.ع
          </span>
        </div>
        <div
          className={styles['pc-builder-price-row']}
          style={{ borderTopColor: resolvedBorderColor }}
        >
          <span className={styles['pc-builder-price-label']} style={{ color: textColor }}>
            {t.totalPrice}
          </span>
          <div className={styles['pc-builder-total-price-wrap']}>
            {totalOriginalPrice > totalPrice && (
              <span className={styles['pc-builder-total-original']} style={{ color: textColor }}>
                ${totalOriginalPrice.toLocaleString()}
              </span>
            )}
            <span className={styles['pc-builder-price-value']} style={{ color: textColor }}>
              ${totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
        <div className={styles['pc-builder-whatsapp-notice']} style={{ color: textColor }}>
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
              color: submitDisabled ? textColor : '#ffffff',
              backgroundColor: submitDisabled ? resolvedBorderColor : '#ffcb6b',
            }}
          >
            {submitLabel[currentLocale] || submitLabel.en}
          </button>
        </form>
      </div>
    </div>
  )
}
