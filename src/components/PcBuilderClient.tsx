'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocalStorageState } from '../utils/pc_build_local_storage'
import {
  COMPONENT_SLOTS,
  dict,
  PcBuilderClientProps,
  phoneErrorLabel,
  submitLabel,
  whatsappPriceNotice,
} from '@/utils/pc_build_items'
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

function normalizeIraqiNumber(number: string): string {
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (!digits.startsWith('964')) digits = '964' + digits
  return digits
}

export default function PcBuilderClient({
  products,
  currentLocale,
  isRtl,
  generals,
}: PcBuilderClientProps & { generals?: GeneralSettingsData }) {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

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

  // 🟢 NEW: State handling configuration for the custom confirmation modal window
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)

  const dynamicExchangeRate = generals?.exchangeRate ?? 1500

  // Signal layout mounting sequence to prevent layout flashes
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    let partsParam = searchParams.get('parts')

    if (!partsParam && typeof window !== 'undefined') {
      const nativeParams = new URLSearchParams(window.location.search)
      partsParam = nativeParams.get('parts')
    }

    if (!partsParam) return

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
              acc[slotKey] = { ...matchedProduct, quantity: matchedProduct.quantity || 1 }
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
      console.error('System failed to process blueprint:', error)
    }
  }, [searchParams, products, setSelections, currentLocale, mounted])

  const openModal = (slotKey: string) => setActiveModalSlot(slotKey)
  const closeModal = () => setActiveModalSlot(null)

  const getLocalizedTitle = useCallback(
    (product: any): string => {
      if (!product) return ''
      const rawTitle = product.title || ''
      if (fallbackCatalog[rawTitle]) {
        return fallbackCatalog[rawTitle][currentLocale as 'en' | 'ar' | 'ckb'] || rawTitle
      }
      return rawTitle
    },
    [currentLocale],
  )

  const selectComponent = (slotKey: string, product: any) => {
    setSelections((prev) => ({
      ...prev,
      [slotKey]: { ...product, quantity: product.quantity || 1 },
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

  // 🟢 UPDATED: Triggers custom validation modal view instead of a system confirm window
  const triggerClearAllRequest = () => {
    if (Object.keys(selections).length === 0) return
    setShowClearConfirmModal(true)
  }

  const confirmClearAllComponents = () => {
    setSelections({})
    setShowClearConfirmModal(false)
  }

  const updateSlotQuantity = (slotKey: string, delta: number) => {
    setSelections((prev) => {
      const currentItem = prev[slotKey]
      if (!currentItem) return prev
      const currentQty = currentItem.quantity || 1
      const nextQty = currentQty + delta
      if (nextQty < 1) return prev

      return {
        ...prev,
        [slotKey]: { ...currentItem, quantity: nextQty },
      }
    })
  }

  // Calculate prices using useMemo to avoid recalculating on unrelated state updates
  const { totalPrice, totalOriginalPrice } = useMemo(() => {
    if (!mounted) return { totalPrice: 0, totalOriginalPrice: 0 }
    const values = Object.values(selections)
    return {
      totalPrice: values.reduce(
        (sum, item) => sum + getDiscountedPrice(item) * (item.quantity || 1),
        0,
      ),
      totalOriginalPrice: values.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
        0,
      ),
    }
  }, [selections, mounted])

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

    const specLines: string[] = []
    COMPONENT_SLOTS.forEach((slot) => {
      const chosen = selections[slot.key]
      if (chosen) {
        const qty = chosen.quantity || 1
        const unitPrice = getDiscountedPrice(chosen)
        const lineTotal = unitPrice * qty
        const itemTitle = getLocalizedTitle(chosen)
        const qtyPrefix = qty > 1 ? `(${qty}x) ` : ''
        specLines.push(
          `⚙️ *${slot.label}:* ${qtyPrefix}${itemTitle} ($${lineTotal.toLocaleString()})`,
        )
      }
    })

    const finalIqd = (totalPrice * dynamicExchangeRate).toLocaleString()
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

    const sellerNumber = '9647701414269'
    const encodedMessage = encodeURIComponent(waMessageText)
    window.open(
      `https://wa.me/${normalizeIraqiNumber(sellerNumber)}?text=${encodedMessage}`,
      '_blank',
    )
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

  const t = dict[currentLocale] || dict['en']
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)
  const fontFam = isRegionalLocale
    ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

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

      {/* 🟢 UPDATED ACTION ZONE: Placed directly above the main builder list container */}
      {mounted && Object.keys(selections).length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: isRtl ? 'flex-start' : 'flex-end',
            marginBottom: '1rem',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={triggerClearAllRequest}
            className={`${styles['pc-builder-btn']} ${styles.clear}`}
            style={{
              padding: '0.625rem 1.25rem',
              fontWeight: '600',
              fontSize: '0.9rem',
              fontFamily: fontFam,
              borderRadius: '6px',
              minWidth: '140px',
            }}
          >
            {currentLocale === 'ckb'
              ? 'پاشگەرزبوونەوە'
              : currentLocale === 'ar'
                ? 'إلغاء الكل'
                : 'Clear All'}
          </button>
        </div>
      )}

      <div className={styles['pc-builder-layout-grid']}>
        <div className={styles['pc-builder-slots-list']}>
          {COMPONENT_SLOTS.map((slot) => {
            const chosenItem = mounted ? selections[slot.key] : null
            const itemImageUrl = chosenItem?.featuredImage?.url || chosenItem?.meta?.image?.url
            const qty = chosenItem?.quantity || 1

            const originalPrice = chosenItem ? (Number(chosenItem.price) || 0) * qty : 0
            const finalItemPrice = chosenItem ? getDiscountedPrice(chosenItem) * qty : 0
            const hasItemDiscount = chosenItem ? !!chosenItem.hasDiscount : false
            const isMultiSlot = ['ram', 'storage', 'ssd', 'hdd', 'memory', 'm-2', 'm2'].includes(
              slot.key.toLowerCase() || slot.categorySlug.toLowerCase(),
            )

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
                        sizes="100px"
                        fill
                        src={itemImageUrl}
                        alt={getLocalizedTitle(chosenItem)}
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      <Image
                        height={50}
                        sizes="50px"
                        width={50}
                        style={{ objectFit: 'contain' }}
                        src={
                          (slot as any).defaultImage || `/categories/${slot.key.toLowerCase()}.png`
                        }
                        alt={slot.label}
                      />
                    )}
                  </div>
                  <div>
                    <span className={styles['pc-builder-slot-label']}>{slot.label}</span>
                    {chosenItem ? (
                      <div className={styles['pc-builder-chosen-title']}>
                        {qty > 1 && <strong style={{ color: '#ffb83c' }}>{qty}x </strong>}
                        {getLocalizedTitle(chosenItem)}{' '}
                        <span className={styles['pc-builder-chosen-price']}>
                          {hasItemDiscount ? (
                            <>
                              <span className={styles['pc-builder-price-original']}>
                                (${originalPrice})
                              </span>
                              <span className={styles['pc-builder-price-final']}>
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
                  {chosenItem && isMultiSlot && (
                    <div
                      className={styles['pc-builder-main-stepper']}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => updateSlotQuantity(slot.key, -1)}
                        className={styles['pc-builder-slot-qty-btn']}
                        disabled={qty <= 1}
                      >
                        -
                      </button>
                      <span className={styles['pc-builder-slot-qty-num']}>{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateSlotQuantity(slot.key, 1)}
                        className={styles['pc-builder-slot-qty-btn']}
                      >
                        +
                      </button>
                    </div>
                  )}

                  {chosenItem && (
                    <button
                      type="button"
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
                    type="button"
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
                {currentLocale === 'ckb'
                  ? 'کۆی گشتی نرخ (IQD)'
                  : currentLocale === 'ar'
                    ? 'إجمالي السعر (IQD)'
                    : 'Total Price (IQD)'}
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
                <span className={styles['pc-builder-price-value']}>
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className={styles['pc-builder-whatsapp-notice']}>
              ℹ️ {whatsappPriceNotice[currentLocale] || whatsappPriceNotice.en}
            </div>

            <form onSubmit={handleWhatsAppBuildOrder} className={styles['pc-builder-order-form']}>
              <input
                type="tel"
                value={buyerNumber}
                onChange={(e) => setBuyerNumber(e.target.value)}
                required
                className={styles['pc-builder-phone-input']}
                aria-label={
                  currentLocale === 'ckb'
                    ? 'ژمارەی مۆبایل'
                    : currentLocale === 'ar'
                      ? 'رقم الهاتف'
                      : 'Phone number'
                }
              />
              <button
                type="submit"
                disabled={!mounted || Object.keys(selections).length === 0}
                className={`${styles['pc-builder-submit-btn']} ${!mounted || Object.keys(selections).length === 0 ? styles.disabled : ''}`}
                style={{ fontFamily: fontFam }}
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

      {/* 🟢 NEW: Custom Confirmation Overlay Modal (Replaces window.confirm system prompt) */}
      {showClearConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowClearConfirmModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4
              style={{
                margin: '0 0 0.75rem 0',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#f8fafc',
                fontFamily: fontFam,
              }}
            >
              {currentLocale === 'ckb'
                ? 'پاشگەرزبوونەوە لە سەرجەم پارچەکان'
                : currentLocale === 'ar'
                  ? 'مسح جميع القطع المختارة'
                  : 'Clear Current Build Selection'}
            </h4>
            <p
              style={{
                margin: '0 0 1.5rem 0',
                fontSize: '0.95rem',
                color: '#94a3b8',
                lineHeight: '1.5',
                fontFamily: fontFam,
              }}
            >
              {currentLocale === 'ckb'
                ? 'دڵنیای لە سڕینەوەی سەرجەم پارچەکان کە تا ئێستا هەڵت بژاردوون؟ ئەم کارە ناگەڕێتەوە دواوە.'
                : currentLocale === 'ar'
                  ? 'هل أنت متأكد من مسح جميع القطع التي قمت باختيارها؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to completely remove all components from your custom setup? This action cannot be undone.'}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                flexDirection: isRtl ? 'row-reverse' : 'row',
              }}
            >
              <button
                type="button"
                onClick={confirmClearAllComponents}
                className={`${styles['pc-builder-btn']} ${styles.clear}`}
                style={{ flex: 1, padding: '0.75rem', fontWeight: '600', fontFamily: fontFam }}
              >
                {currentLocale === 'ckb'
                  ? 'بەڵێ، بسڕەوە'
                  : currentLocale === 'ar'
                    ? 'نعم، امسح الكل'
                    : 'Yes, Clear All'}
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className={`${styles['pc-builder-btn']} ${styles.action}`}
                style={{ flex: 1, padding: '0.75rem', fontWeight: '600', fontFamily: fontFam }}
              >
                {currentLocale === 'ckb'
                  ? 'پاشگەزبوونەوە'
                  : currentLocale === 'ar'
                    ? 'إلغاء'
                    : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
