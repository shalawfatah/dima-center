'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalStorageState } from '../utils/pc_build_local_storage'
import { COMPONENT_SLOTS, dict, PcBuilderClientProps } from '@/utils/pc_build_items'
import Image from 'next/image'

interface GeneralSettingsData {
  exchangeRate?: number
  slogan?: string
  logo?: any
  email?: string
  phone?: string
  address?: string
  socials?: Array<{ platform: string; url: string }>
}

export default function PcBuilderClient({
  products,
  user,
  currentLocale,
  isRtl,
  generals,
}: PcBuilderClientProps & { generals?: GeneralSettingsData }) {
  const router = useRouter()
  const [buildName, setBuildName] = useLocalStorageState<string>(
    'pc_build_name',
    'My Dream Rig Build',
  )
  const [selections, setSelections] = useLocalStorageState<Record<string, any>>(
    'pc_build_selections',
    {},
  )

  const [activeModalSlot, setActiveModalSlot] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Extract dynamic exchange rate from Payload Generals config with a fallback metric
  const dynamicExchangeRate = generals?.exchangeRate ?? 1500

  const openModal = (slotKey: string) => setActiveModalSlot(slotKey)
  const closeModal = () => setActiveModalSlot(null)

  const selectComponent = (slotKey: string, product: any) => {
    setSelections((prev) => ({
      ...prev,
      [slotKey]: product,
    }))
    closeModal()
  }

  const removeComponent = (slotKey: string) => {
    setSelections((prev) => {
      const updated = { ...prev }
      delete updated[slotKey]
      return updated
    })
  }

  const totalPrice = Object.values(selections).reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  )

  const currentSlotConfig = COMPONENT_SLOTS.find((s) => s.key === activeModalSlot)
  const filteredProducts = products.filter((prod) => {
    if (!currentSlotConfig) return false
    const prodCategory = prod.category
    if (typeof prodCategory === 'object' && prodCategory !== null) {
      return prodCategory.slug === currentSlotConfig.categorySlug
    }
    return String(prodCategory).toLowerCase() === currentSlotConfig.categorySlug.toLowerCase()
  })

  const handleSaveBuild = async () => {
    if (!user) return
    setIsSaving(true)
    setMessage({ type: '', text: '' })

    const componentsData: Record<string, string> = {}
    COMPONENT_SLOTS.forEach((slot) => {
      if (selections[slot.key]) {
        componentsData[slot.key] = selections[slot.key].id
      }
    })

    const t = dict[currentLocale] || dict['en']

    try {
      const res = await fetch('/api/pc-builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: buildName,
          user: user.id,
          totalPrice: totalPrice,
          components: componentsData,
        }),
      })

      if (res.ok) {
        window.localStorage.removeItem('pc_build_selections')
        window.localStorage.removeItem('pc_build_name')

        setMessage({ type: 'success', text: 'Rig blueprint layout secured successfully!' })
        router.push(`/${currentLocale}/account`)
      } else {
        setMessage({ type: 'error', text: 'Failed to preserve layout blueprint metrics.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected system networking error occurred.' })
    } finally {
      setIsSaving(false)
    }
  }

  const getLocalizedTitle = (product: any): string => {
    if (!product) return ''

    const fallbackCatalog: Record<string, Record<'en' | 'ar' | 'ckb', string>> = {
      'ئێم ئێس ئای پرۆ B760M-E DDR5': {
        en: 'MSI Pro B760M-E DDR5 Motherboard',
        ar: 'لوحة أم ام اس اي برو B760M-E DDR5',
        ckb: 'ئێم ئێس ئای پرۆ B760M-E DDR5',
      },
      'ئەی ئێم دی ڕادیۆن RX 7900 XTX': {
        en: 'AMD Radeon RX 7900 XTX Graphics Card',
        ar: 'کارت شاشة اي ام دي راديون RX 7900 XTX',
        ckb: 'ئەی ئێم دی ڕادیۆن RX 7900 XTX',
      },
      'پرۆسێسەری یاری RX 7800X3D': {
        en: 'AMD Ryzen 7 7800X3D Gaming Processor',
        ar: 'معالج الألعاب اي ام دي رايزن 7 7800X3D',
        ckb: 'پرۆسێسەری یاری RX 7800X3D',
      },
      'ئینتێل کۆر i9-14900K': {
        en: 'Intel Core i9-14900K Processor',
        ar: 'معالج إنتل كور i9-14900K',
        ckb: 'ئینتێل کۆر i9-14900K',
      },
      'ماکبوک پرۆ ١٦ ئینچ': {
        en: 'Apple MacBook Pro 16-inch (M4 Pro)',
        ar: 'ماكبوك برو ١٦ إنش',
        ckb: 'ماکبوک پرۆ ١٦ ئینچ',
      },
    }

    const rawTitle = product.title || ''
    if (fallbackCatalog[rawTitle]) {
      return fallbackCatalog[rawTitle][currentLocale as 'en' | 'ar' | 'ckb'] || rawTitle
    }
    return rawTitle
  }

  // Multi-locale string label routing map for dynamic dynamic rendering layout
  const getExchangeLabel = (): string => {
    if (currentLocale === 'ckb') return 'کۆی گشتی نرخ (IQD)'
    if (currentLocale === 'ar') return 'إجمالي السعر (IQD)'
    return 'Total Price (IQD)'
  }

  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)
  const fontFam = isRegionalLocale
    ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  const t = dict[currentLocale] || dict['en']

  return (
    <div
      className="pc-builder-container"
      style={
        {
          '--font-family': fontFam,
          direction: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left',
        } as React.CSSProperties
      }
    >
      <style>{`
        .pc-builder-container {
          max-width: 1800px;
          margin: 2rem auto;
          padding: 0 1.5rem;
          font-family: var(--font-family);
        }
        .pc-builder-header {
          margin-bottom: 2rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1.5rem;
        }
        .pc-builder-title {
          font-size: 2.25rem;
          font-weight: 800;
          margin: 0;
          color: #000;
        }
        .pc-builder-subtitle {
          color: #64748b;
          margin-top: 0.5rem;
        }
        .pc-builder-alert {
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 6px;
          font-weight: 500;
        }
        .pc-builder-alert.success {
          background-color: #dcfce7;
          color: #15803d;
        }
        .pc-builder-alert.error {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        .pc-builder-layout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2rem;
          align-items: start;
        }
        .pc-builder-slots-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .pc-builder-component-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.25rem;
          background: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
        }
        .pc-builder-component-card:hover {
          border-color: #3b82f6 !important;
        }
        .pc-builder-card-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }
        .pc-builder-thumb-box {
          width: 50px;
          height: 50px;
          border-radius: 6px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .pc-builder-slot-label {
          font-size: 11px;
          font-weight: bold;
          color: #64748b;
          text-transform: uppercase;
          display: block;
        }
        .pc-builder-chosen-title {
          margin-top: 0.15rem;
          font-weight: 600;
          font-size: 16px;
          color: #000;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pc-builder-chosen-price {
          color: #10b981;
        }
        .pc-builder-empty-slot {
          margin-top: 0.15rem;
          color: #cbd5e1;
          font-style: italic;
          font-size: 14px;
        }
        .pc-builder-actions-group {
          display: flex;
          gap: 8px;
        }
        .pc-builder-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }
        .pc-builder-btn.clear {
          background: #fee2e2;
          color: #b91c1c;
        }
        .pc-builder-btn.action {
          background: #f1f5f9;
          color: #334155;
        }
        .pc-builder-sidebar {
          position: sticky;
          top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .pc-builder-summary-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          background: #fff;
        }
        .pc-builder-summary-heading {
          margin: 0 0 1rem 0;
          font-size: 18px;
          font-weight: 700;
          color: #000;
        }
        .pc-builder-field-group {
          margin-bottom: 1rem;
        }
        .pc-builder-input-label {
          font-size: 12px;
          color: #94a3b8;
          display: block;
          margin-bottom: 4px;
        }
        .pc-builder-text-input {
          width: 100%;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #000;
          font-size: 14px;
        }
        .pc-builder-exchange-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f3f3f3;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .pc-builder-exchange-label {
          font-size: 14px;
          color: #000;
          font-weight: 600;
        }
        .pc-builder-exchange-value {
          font-size: 16px;
          font-weight: 800;
          color: #000;
        }
        .pc-builder-price-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          border-top: 1px solid #e2e8f0;
          padding-top: 1rem;
          margin-bottom: 1.5rem;
        }
        .pc-builder-price-label {
          font-size: 14px;
          color: #64748b;
        }
        .pc-builder-price-value {
          font-size: 24px;
          font-weight: 800;
          color: #10b981;
        }
        .pc-builder-submit-btn {
          width: 100%;
          padding: 12px;
          background: #ffcb6b;
          color: #000;
          border: none;
          border-radius: 6px;
          font-weight: 600;
        }
        .pc-builder-auth-notice {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
        }
        .pc-builder-auth-link {
          color: #3b82f6;
          font-weight: 600;
          text-decoration: underline;
        }
        .pc-builder-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .pc-builder-modal-window {
          background-color: #fff;
          border-radius: 12px;
          width: 100%;
          max-width: 650px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }
        .pc-builder-modal-header {
          padding: 1.25rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pc-builder-modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #000;
        }
        .pc-builder-modal-close {
          border: none;
          background: none;
          font-size: 20px;
          cursor: pointer;
          color: #64748b;
          font-weight: bold;
        }
        .pc-builder-modal-body {
          padding: 1.25rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pc-builder-modal-empty {
          color: #94a3b8;
          font-size: 14px;
          font-style: italic;
          text-align: center;
          padding: 2rem 0;
        }
        .pc-builder-product-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pc-builder-product-row:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
        .pc-builder-product-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .pc-builder-product-thumb {
          width: 45px;
          height: 45px;
          border-radius: 6px;
          background: #fff;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .pc-builder-product-title {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
        }
        .pc-builder-product-price {
          font-weight: 700;
          color: #10b981;
          font-size: 15px;
        }

        @media (max-width: 992px) {
          .pc-builder-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .pc-builder-sidebar {
            position: relative !important;
            top: 0 !important;
            width: 100% !important;
          }
          .pc-builder-component-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .pc-builder-actions-group {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>

      <header className="pc-builder-header">
        <h1 className="pc-builder-title">{t.title}</h1>
        <p className="pc-builder-subtitle">{t.subtitle}</p>
      </header>

      {message.text && <div className={`pc-builder-alert ${message.type}`}>{message.text}</div>}

      <div className="pc-builder-layout-grid">
        <div className="pc-builder-slots-list">
          {COMPONENT_SLOTS.map((slot) => {
            const chosenItem = selections[slot.key]
            const itemImageUrl = chosenItem?.featuredImage?.url || chosenItem?.meta?.image?.url

            return (
              <div
                key={slot.key}
                onClick={() => openModal(slot.key)}
                className="pc-builder-component-card"
              >
                <div className="pc-builder-card-meta">
                  <div className="pc-builder-thumb-box">
                    {itemImageUrl ? (
                      <Image
                        height={100}
                        width={100}
                        src={itemImageUrl}
                        alt={getLocalizedTitle(chosenItem)}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Image
                        height={50}
                        width={50}
                        src={(slot as any).defaultImage || `/categories/${slot.key}.png`}
                        alt={slot.label}
                        className="object-contain opacity-60 w-4/5 h-4/5"
                      />
                    )}
                  </div>

                  <div>
                    <span className="pc-builder-slot-label">{slot.label}</span>
                    {chosenItem ? (
                      <div className="pc-builder-chosen-title">
                        {getLocalizedTitle(chosenItem)}
                        <span className="pc-builder-chosen-price">(${chosenItem.price})</span>
                      </div>
                    ) : (
                      <div className="pc-builder-empty-slot">{t.noPart}</div>
                    )}
                  </div>
                </div>

                <div className="pc-builder-actions-group">
                  {chosenItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeComponent(slot.key)
                      }}
                      className="pc-builder-btn clear"
                    >
                      {t.clear}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openModal(slot.key)
                    }}
                    className="pc-builder-btn action"
                  >
                    {chosenItem ? t.change : t.choose}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="pc-builder-sidebar">
          <div className="pc-builder-summary-card">
            <h3 className="pc-builder-summary-heading">{t.summary}</h3>

            <div className="pc-builder-field-group">
              <label className="pc-builder-input-label">{t.configName}</label>
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                className="pc-builder-text-input"
              />
            </div>

            {/* Dynamic IQD Exchange Rate Box Boxed Above Total */}
            <div className="pc-builder-exchange-container">
              <span className="pc-builder-exchange-label">{getExchangeLabel()}</span>
              <span className="pc-builder-exchange-value">
                {(totalPrice * dynamicExchangeRate).toLocaleString()} د.ع
              </span>
            </div>

            <div className="pc-builder-price-row">
              <span className="pc-builder-price-label">{t.totalPrice}</span>
              <span className="pc-builder-price-value">${totalPrice.toLocaleString()}</span>
            </div>

            {user ? (
              <button
                onClick={handleSaveBuild}
                disabled={isSaving || Object.keys(selections).length === 0}
                className="pc-builder-submit-btn"
                style={{
                  cursor: Object.keys(selections).length === 0 ? 'not-allowed' : 'pointer',
                  opacity: Object.keys(selections).length === 0 || isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? t.saving : t.saveBtn}
              </button>
            ) : (
              <div className="pc-builder-auth-notice">
                {t.loginPrompt} <br />
                <a href={`/${currentLocale}/login`} className="pc-builder-auth-link">
                  {t.signIn}
                </a>{' '}
                {t.saveSuffix}
              </div>
            )}
          </div>
        </div>
      </div>

      {activeModalSlot && currentSlotConfig && (
        <div className="pc-builder-modal-overlay" onClick={closeModal}>
          <div className="pc-builder-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="pc-builder-modal-header">
              <h3 className="pc-builder-modal-title">
                {t.modalSelectPrefix} {currentSlotConfig.label}
              </h3>
              <button onClick={closeModal} className="pc-builder-modal-close">
                &times;
              </button>
            </div>

            <div className="pc-builder-modal-body">
              {filteredProducts.length === 0 ? (
                <p className="pc-builder-modal-empty">
                  {t.noItems} "{currentSlotConfig.categorySlug}".
                </p>
              ) : (
                filteredProducts.map((prod) => {
                  const modalProductImg = prod?.featuredImage?.url || prod?.meta?.image?.url
                  return (
                    <div
                      key={prod.id}
                      onClick={() => selectComponent(activeModalSlot, prod)}
                      className="pc-builder-product-row"
                    >
                      <div className="pc-builder-product-info">
                        <div className="pc-builder-product-thumb">
                          {modalProductImg ? (
                            <Image
                              src={modalProductImg}
                              height={100}
                              width={100}
                              alt={getLocalizedTitle(prod)}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Image
                              height={45}
                              width={45}
                              src={`/categories/${currentSlotConfig.key}.png`}
                              alt={currentSlotConfig.label}
                              className="object-contain opacity-50 w-4/5 h-4/5"
                            />
                          )}
                        </div>
                        <span className="pc-builder-product-title">{getLocalizedTitle(prod)}</span>
                      </div>
                      <span className="pc-builder-product-price">${prod.price}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
