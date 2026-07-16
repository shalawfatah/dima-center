'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocalStorageState } from '../utils/pc_build_local_storage'
import { COMPONENT_SLOTS, dict, PcBuilderClientProps } from '@/utils/pc_build_items'
import Image from 'next/image'
import { fallbackCatalog } from '@/utils/fallback_catalog'
import { GeneralSettingsData } from '@/types/types'
import ProductPickerModal from './ProductPickerModal'
import styles from '@/styles/pc_builder.module.css'

const getDiscountedPrice = (product: any): number => {
  if (!product) return 0
  const originalPrice = Number(product.price) || 0
  if (!product.hasDiscount) return originalPrice

  if (product.discountType === 'fixed') {
    const discount = Number(product.discountValue) || 0
    return Math.max(0, originalPrice - discount)
  } else if (product.discountType === 'percentage') {
    const discountPercent = Number(product.discountValue) || 0
    return Math.max(0, originalPrice - (originalPrice * discountPercent) / 100)
  }
  return originalPrice
}

// 🎯 Quick Iraqi phone utility
function normalizeIraqiNumber(number: string): string {
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1) // drop leading 0
  if (!digits.startsWith('964')) digits = '964' + digits // add country code
  return digits
}

// Localized UI form labels
const phonePlaceholder: Record<string, string> = {
  ar: 'رقم الواتساب (مثال: 07701234567)',
  ckb: 'ژمارەی واتسئەپ (نموونە: 07701234567)',
  en: 'WhatsApp Number (e.g., 07701234567)',
}

const submitLabel: Record<string, string> = {
  ar: 'اطلب هذا التجميع عبر واتساب 🛒',
  ckb: 'داواکردنی ئەم کۆمپیوتەرە بە واتسئەپ 🛒',
  en: 'Order This Build via WhatsApp 🛒',
}

const phoneErrorLabel: Record<string, string> = {
  ar: 'يرجى إدخال رقم هاتفك لإتمام طلب التجميع!',
  ckb: 'تکایە ژمارەی مۆبایلەکەت بنووسە بۆ ناردنی داواکارییەکە!',
  en: 'Please enter your phone number to complete the build order!',
}

// 🎯 Translated WhatsApp pricing notices
const whatsappPriceNotice: Record<string, string> = {
  en: 'This is not the final price. To get a lower, final price, send your order through our WhatsApp.',
  ckb: 'ئەمە نرخی کۆتایی نیە، بۆ نرخی کەمتر و کۆتایی بەرهەمەکەت بنێرە بۆ وەتسئەپەکەمان.',
  ar: 'هذا ليس السعر النهائي، للحصول على سعر نهائي أقل، يرجى إرسال طلبك عبر الواتساب الخاص بنا.',
}

export default function PcBuilderClient({
  products,
  currentLocale,
  isRtl,
  generals,
}: PcBuilderClientProps & { generals?: GeneralSettingsData }) {
  const searchParams = useSearchParams()

  const [buildName, setBuildName] = useLocalStorageState<string>(
    'pc_build_name',
    'My Dream Rig Build',
  )
  const [selections, setSelections] = useLocalStorageState<Record<string, any>>(
    'pc_build_selections',
    {},
  )

  const [activeModalSlot, setActiveModalSlot] = useState<string | null>(null)
  const [buyerNumber, setBuyerNumber] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const dynamicExchangeRate = generals?.exchangeRate ?? 1500

  // 🔄 Handle URL Syncing on Mount
  useEffect(() => {
    let partsParam = searchParams.get('parts')

    if (!partsParam && typeof window !== 'undefined') {
      const nativeParams = new URLSearchParams(window.location.search)
      partsParam = nativeParams.get('parts')
    }

    if (!partsParam) {
      return
    }

    try {
      const incomingParts = partsParam.split(',').reduce(
        (acc, pair) => {
          const [slotKey, productId] = pair.split(':')
          if (slotKey && productId) {
            const matchedProduct = products.find(
              (p) =>
                String(p.id) === String(productId) ||
                (p.code && String(p.code) === String(productId)),
            )

            if (matchedProduct) {
              acc[slotKey] = matchedProduct
            }
          }
          return acc
        },
        {} as Record<string, any>,
      )

      if (Object.keys(incomingParts).length > 0) {
        setSelections((prev) => ({ ...prev, ...incomingParts }))
        const nextUrl = `/${currentLocale}/pc-builder`
        window.history.replaceState(null, '', nextUrl)
      }
    } catch (error) {
      console.error('System failed to process incoming transferred parts blueprint:', error)
    }
  }, [searchParams, products, setSelections, currentLocale])

  const openModal = (slotKey: string) => setActiveModalSlot(slotKey)
  const closeModal = () => setActiveModalSlot(null)

  const selectComponent = (slotKey: string, product: any) => {
    setSelections((prev) => ({ ...prev, [slotKey]: product }))
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
    (sum, item) => sum + getDiscountedPrice(item),
    0,
  )
  const totalOriginalPrice = Object.values(selections).reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  )

  // 🎯 Gathers selections, builds a custom formatted invoice list, and opens WhatsApp
  const handleWhatsAppBuildOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if (!buyerNumber.trim()) {
      alert(phoneErrorLabel[currentLocale] || phoneErrorLabel.en)
      return
    }

    if (Object.keys(selections).length === 0) {
      alert('Please select at least one component before ordering!')
      return
    }

    // 1. Build the spec breakdown text
    const specLines: string[] = []
    COMPONENT_SLOTS.forEach((slot) => {
      const chosen = selections[slot.key]
      if (chosen) {
        const finalPrice = getDiscountedPrice(chosen)
        const itemTitle = getLocalizedTitle(chosen)
        specLines.push(`⚙️ *${slot.label}:* ${itemTitle} ($${finalPrice.toLocaleString()})`)
      }
    })

    const finalIqd = (totalPrice * dynamicExchangeRate).toLocaleString()

    // 2. Draft the beautiful WhatsApp message
    const waMessageText =
      `🖥️ *New PC Build Order Request: "${buildName}"*\n\n` +
      `*Selected Hardware Spec Breakdown:*\n` +
      `---------------------------------\n` +
      `${specLines.join('\n')}\n\n` +
      `---------------------------------\n` +
      `*Total Price (USD):* $${totalPrice.toLocaleString()}\n` +
      `*Total Price (IQD):* ${finalIqd} IQD\n` +
      `*Buyer Phone Number:* ${buyerNumber}\n\n` +
      `🔗 *Build Editor Sync Link:*\n` +
      `${window.location.origin}/${currentLocale}/pc-builder?parts=` +
      COMPONENT_SLOTS.filter((s) => selections[s.key])
        .map((s) => `${s.key}:${selections[s.key].id}`)
        .join(',')

    // 3. Fire WhatsApp redirection
    const sellerNumber = '9647701414269'
    const cleanSellerNumber = normalizeIraqiNumber(sellerNumber)
    const encodedMessage = encodeURIComponent(waMessageText)
    const waLink = `https://wa.me/${cleanSellerNumber}?text=${encodedMessage}`

    window.open(waLink, '_blank')
  }

  const getLocalizedTitle = (product: any): string => {
    if (!product) return ''
    const rawTitle = product.title || ''
    if (fallbackCatalog[rawTitle]) {
      return fallbackCatalog[rawTitle][currentLocale as 'en' | 'ar' | 'ckb'] || rawTitle
    }
    return rawTitle
  }

  const getExchangeLabel = () => {
    if (currentLocale === 'ckb') return 'کۆی گشتی نرخ (IQD)'
    if (currentLocale === 'ar') return 'إجمالي السعر (IQD)'
    return 'Total Price (IQD)'
  }

  const handleAddToCartDefault = (prod: any) => {
    try {
      const stored = localStorage.getItem('cart')
      const cart = stored ? JSON.parse(stored) : []
      const existing = cart.find((item: any) => item.id === prod.id)
      const prodProductImg = prod?.featuredImage?.url || prod?.meta?.image?.url
      const calculatedFinalPrice = getDiscountedPrice(prod)

      if (existing) {
        existing.quantity += 1
      } else {
        cart.push({
          id: prod.id,
          title: getLocalizedTitle(prod),
          price: calculatedFinalPrice,
          quantity: 1,
          imageUrl: prodProductImg,
        })
      }
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))

      const localizedSuccessMsg =
        currentLocale === 'ckb'
          ? 'بەسەرکەوتوویی زیادکرا بۆ سەبەتەکەت!'
          : currentLocale === 'ar'
            ? 'تمت إضافة المنتج إلى السلة بنجاح!'
            : 'Product successfully added to your cart!'

      setMessage({ type: 'success', text: localizedSuccessMsg })
      closeModal()
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Could not update shopping cart assets.' })
    }
  }

  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)
  const fontFam = isRegionalLocale
    ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  const t = dict[currentLocale] || dict['en']

  return (
    <div
      className={styles['pc-builder-container']}
      style={
        {
          '--font-family': fontFam,
          direction: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left',
        } as React.CSSProperties
      }
    >
      <header className={styles['pc-builder-header']}>
        <h1 className={styles['pc-builder-title']}>{t.title}</h1>
        <p className={styles['pc-builder-subtitle']}>{t.subtitle}</p>
      </header>

      {message.text && (
        <div
          className={`${styles['pc-builder-alert']} ${message.type ? styles[message.type] : ''}`}
        >
          {message.text}
        </div>
      )}

      <div className={styles['pc-builder-layout-grid']}>
        <div className={styles['pc-builder-slots-list']}>
          {COMPONENT_SLOTS.map((slot) => {
            const chosenItem = selections[slot.key]
            const itemImageUrl = chosenItem?.featuredImage?.url || chosenItem?.meta?.image?.url
            const originalPrice = chosenItem ? Number(chosenItem.price) || 0 : 0
            const finalItemPrice = chosenItem ? getDiscountedPrice(chosenItem) : 0
            const hasItemDiscount = chosenItem ? !!chosenItem.hasDiscount : false

            return (
              <div
                key={slot.key}
                onClick={() => openModal(slot.key)}
                className={styles['pc-builder-component-card']}
              >
                <div className={styles['pc-builder-card-meta']}>
                  <div className={styles['pc-builder-thumb-box']}>
                    {itemImageUrl ? (
                      <Image
                        height={100}
                        width={100}
                        src={itemImageUrl}
                        alt={getLocalizedTitle(chosenItem)}
                        className="object-cover w-full h-full"
                        style={{ height: 'auto' }}
                      />
                    ) : (
                      <Image
                        height={50}
                        width={50}
                        src={(slot as any).defaultImage || `/categories/${slot.key}.png`}
                        alt={slot.label}
                        className="object-contain opacity-60 w-4/5 h-4/5"
                        style={{ height: 'auto' }}
                      />
                    )}
                  </div>
                  <div>
                    <span className={styles['pc-builder-slot-label']}>{slot.label}</span>
                    {chosenItem ? (
                      <div className={styles['pc-builder-chosen-title']}>
                        {getLocalizedTitle(chosenItem)}{' '}
                        <span className={styles['pc-builder-chosen-price']}>
                          {hasItemDiscount ? (
                            <>
                              <span
                                style={{
                                  textDecoration: 'line-through',
                                  color: '#888',
                                  marginRight: '4px',
                                }}
                              >
                                (${originalPrice})
                              </span>
                              <span style={{ fontWeight: 'bold', color: '#22c55e' }}>
                                (${finalItemPrice})
                              </span>
                            </>
                          ) : (
                            <span>(${originalPrice})</span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className={styles['pc-builder-empty-slot']}>{t.noPart}</div>
                    )}
                  </div>
                </div>
                <div className={styles['pc-builder-actions-group']}>
                  {chosenItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeComponent(slot.key)
                      }}
                      className={`${styles['pc-builder-btn']} ${styles.clear}`}
                    >
                      {t.clear}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openModal(slot.key)
                    }}
                    className={`${styles['pc-builder-btn']} ${styles.action}`}
                  >
                    {chosenItem ? t.change : t.choose}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className={styles['pc-builder-sidebar']}>
          <div className={styles['pc-builder-summary-card']}>
            <h3 className={styles['pc-builder-summary-heading']}>{t.summary}</h3>

            <div className={styles['pc-builder-field-group']}>
              <label className={styles['pc-builder-input-label']}>{t.configName}</label>
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                className={styles['pc-builder-text-input']}
              />
            </div>

            <div className={styles['pc-builder-exchange-container']}>
              <span className={styles['pc-builder-exchange-label']}>{getExchangeLabel()}</span>
              <span className={styles['pc-builder-exchange-value']}>
                {(totalPrice * dynamicExchangeRate).toLocaleString()} د.ع
              </span>
            </div>

            <div className={styles['pc-builder-price-row']}>
              <span className={styles['pc-builder-price-label']}>{t.totalPrice}</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {totalOriginalPrice > totalPrice && (
                  <span
                    style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.9em' }}
                  >
                    ${totalOriginalPrice.toLocaleString()}
                  </span>
                )}
                <span className={styles['pc-builder-price-value']}>
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 🎯 Localized green/red styled notice banner above submit form */}
            <div
              style={{
                backgroundColor: 'rgba(37, 211, 102, 0.08)', // Light WhatsApp Green tint
                border: '1px dashed rgba(37, 211, 102, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '16px',
                color: '#C04000', // Dark forest/emerald green text
                lineHeight: '1.4',
                marginTop: '1.25rem',
                fontWeight: '500',
              }}
            >
              ℹ️ {whatsappPriceNotice[currentLocale] || whatsappPriceNotice.en}
            </div>

            <form
              onSubmit={handleWhatsAppBuildOrder}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginTop: '0.75rem',
              }}
            >
              <input
                type="tel"
                placeholder={phonePlaceholder[currentLocale] || phonePlaceholder.en}
                value={buyerNumber}
                onChange={(e) => setBuyerNumber(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={Object.keys(selections).length === 0}
                className={styles['pc-builder-submit-btn']}
                style={{
                  width: '100%',
                  background: '#25D366', // WhatsApp Brand Green
                  color: '#fff',
                  border: 'none',
                  cursor: Object.keys(selections).length === 0 ? 'not-allowed' : 'pointer',
                  opacity: Object.keys(selections).length === 0 ? 0.6 : 1,
                  fontFamily: fontFam,
                }}
              >
                {submitLabel[currentLocale] || submitLabel.en}
              </button>
            </form>
          </div>
        </div>
      </div>

      {activeModalSlot && (
        <ProductPickerModal
          activeModalSlot={activeModalSlot}
          products={products}
          currentLocale={currentLocale}
          labels={{ modalSelectPrefix: t.modalSelectPrefix, noItems: t.noItems }}
          getLocalizedTitle={getLocalizedTitle}
          onSelect={selectComponent}
          onAddToCart={handleAddToCartDefault}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
