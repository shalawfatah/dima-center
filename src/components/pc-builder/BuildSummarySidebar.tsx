import React from 'react'
import { exchangeLabel, phoneAriaLabel, pickLocale } from '@/utils/pc_builder_translations'
import { submitLabel, whatsappPriceNotice } from '@/utils/pc_build_items'
import styles from '@/styles/pc_builder.module.css'

interface BuildSummarySidebarProps {
  t: Record<string, string>
  currentLocale: string
  mounted: boolean
  buildName: string
  setBuildName: (name: string) => void
  totalPrice: number
  totalOriginalPrice: number
  dynamicExchangeRate: number
  buyerNumber: string
  setBuyerNumber: (value: string) => void
  hasSelections: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  fontFam: string
}

export default function BuildSummarySidebar({
  t,
  currentLocale,
  mounted,
  buildName,
  setBuildName,
  totalPrice,
  totalOriginalPrice,
  dynamicExchangeRate,
  buyerNumber,
  setBuyerNumber,
  hasSelections,
  onSubmit,
  fontFam,
}: BuildSummarySidebarProps) {
  const submitDisabled = !mounted || !hasSelections

  return (
    <div className={styles['pc-builder-sidebar']}>
      <div className={styles['pc-builder-summary-card']}>
        <h3 className={styles['pc-builder-summary-heading']}>{t.summary}</h3>

        <div className={styles['pc-builder-field-group']}>
          <label htmlFor="pc-builder-build-name" className={styles['pc-builder-input-label']}>
            {t.configName}
          </label>
          <input
            type="text"
            id="pc-builder-build-name"
            value={mounted ? buildName : ''}
            onChange={(e) => setBuildName(e.target.value)}
            className={styles['pc-builder-text-input']}
          />
        </div>

        <div className={styles['pc-builder-exchange-container']}>
          <span className={styles['pc-builder-exchange-label']}>
            {pickLocale(exchangeLabel, currentLocale)}
          </span>
          <span className={styles['pc-builder-exchange-value']}>
            {(totalPrice * dynamicExchangeRate).toLocaleString()} د.ع
          </span>
        </div>

        <div className={styles['pc-builder-price-row']}>
          <span className={styles['pc-builder-price-label']}>{t.totalPrice}</span>
          <div className={styles['pc-builder-total-price-wrap']}>
            {totalOriginalPrice > totalPrice && (
              <span className={styles['pc-builder-total-original']}>
                ${totalOriginalPrice.toLocaleString()}
              </span>
            )}
            <span className={styles['pc-builder-price-value']}>${totalPrice.toLocaleString()}</span>
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
          />
          <button
            type="submit"
            disabled={submitDisabled}
            className={`${styles['pc-builder-submit-btn']} ${submitDisabled ? styles.disabled : ''}`}
            style={{ fontFamily: fontFam }}
          >
            {submitLabel[currentLocale] || submitLabel.en}
          </button>
        </form>
      </div>
    </div>
  )
}
