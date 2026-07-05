'use client'

import { getExchangeLabel } from './getLocalizedTitle'

interface SummaryLabels {
  summary: string
  configName: string
  totalPrice: string
  saving: string
  saveBtn: string
  loginPrompt: string
  signIn: string
  saveSuffix: string
}

interface BuildSummarySidebarProps {
  buildName: string
  onNameChange: (value: string) => void
  totalPrice: number
  exchangeRate: number
  currentLocale: string
  user: any
  isSaving: boolean
  hasSelections: boolean
  onSave: () => void
  labels: SummaryLabels
}

export default function BuildSummarySidebar({
  buildName,
  onNameChange,
  totalPrice,
  exchangeRate,
  currentLocale,
  user,
  isSaving,
  hasSelections,
  onSave,
  labels,
}: BuildSummarySidebarProps) {
  return (
    <div className="pc-builder-sidebar">
      <div className="pc-builder-summary-card">
        <h3 className="pc-builder-summary-heading">{labels.summary}</h3>

        <div className="pc-builder-field-group">
          <label className="pc-builder-input-label">{labels.configName}</label>
          <input
            type="text"
            value={buildName}
            onChange={(e) => onNameChange(e.target.value)}
            className="pc-builder-text-input"
          />
        </div>

        {/* Dynamic IQD exchange rate, sourced from Payload Generals config */}
        <div className="pc-builder-exchange-container">
          <span className="pc-builder-exchange-label">{getExchangeLabel(currentLocale)}</span>
          <span className="pc-builder-exchange-value">
            {(totalPrice * exchangeRate).toLocaleString()} د.ع
          </span>
        </div>

        <div className="pc-builder-price-row">
          <span className="pc-builder-price-label">{labels.totalPrice}</span>
          <span className="pc-builder-price-value">${totalPrice.toLocaleString()}</span>
        </div>

        {user ? (
          <button
            onClick={onSave}
            disabled={isSaving || !hasSelections}
            className="pc-builder-submit-btn"
            style={{
              cursor: !hasSelections ? 'not-allowed' : 'pointer',
              opacity: !hasSelections || isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? labels.saving : labels.saveBtn}
          </button>
        ) : (
          <div className="pc-builder-auth-notice">
            {labels.loginPrompt} <br />
            <a href={`/${currentLocale}/login`} className="pc-builder-auth-link">
              {labels.signIn}
            </a>{' '}
            {labels.saveSuffix}
          </div>
        )}
      </div>
    </div>
  )
}
