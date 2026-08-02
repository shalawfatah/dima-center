'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocalStorageState } from '../utils/pc_build_local_storage'
import {
  COMPONENT_SLOTS,
  dict,
  PcBuilderClientProps,
  phoneErrorLabel,
} from '@/utils/pc_build_items'
import { GeneralSettingsData } from '@/types/types'
import ProductPickerModal from './ProductPickerModal'
import ComponentSlotCard from '@/components/pc-builder/ComponentSlotCard'
import BuildSummarySidebar from '@/components/pc-builder/BuildSummarySidebar'
import ClearConfirmModal from '@/components/pc-builder/ClearConfirmModal'
import { calculateBuildTotals } from '@/utils/pc_builder_pricing'
import { clearAllLabel, emptySelectionAlert, pickLocale } from '@/utils/pc_builder_translations'
import { getLocalizedProductTitle } from '@/utils/get_localized_title'
import { addProductToCart } from '@/utils/pc_builder_cart'
import { buildWhatsAppOrderMessage, sendWhatsAppOrder } from '@/utils/pc_builder_whatsapp'
import styles from '@/styles/pc_builder.module.css'
import { usePcBuilderUrlSync } from '@/utils/use_pc_builder_url_sync'

interface ExtendedPcBuilderClientProps extends PcBuilderClientProps {
  generals?: GeneralSettingsData
  headingFont?: string
  bodyFont?: string
  dynamicFontFaceCSS?: string
  titleColor?: string
  bodyColor?: string
}

export default function PcBuilderClient({
  products,
  currentLocale,
  isRtl,
  generals,
  headingFont,
  bodyFont,
  dynamicFontFaceCSS,
  titleColor,
  bodyColor,
}: ExtendedPcBuilderClientProps) {
  const [mounted, setMounted] = useState(false)

  const [selections, setSelections] = useLocalStorageState<Record<string, any>>(
    'pc_build_selections',
    {},
  )

  const [activeModalSlot, setActiveModalSlot] = useState<string | null>(null)
  const [buyerNumber, setBuyerNumber] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)

  const dynamicExchangeRate = generals?.exchangeRate ?? 1500

  // Signal layout mounting sequence to prevent layout flashes without synchronous setState warning
  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true)
    })
  }, [])

  usePcBuilderUrlSync({ mounted, products, currentLocale, setSelections })

  const openModal = (slotKey: string) => setActiveModalSlot(slotKey)
  const closeModal = () => setActiveModalSlot(null)

  const getLocalizedTitle = useCallback(
    (product: any) => getLocalizedProductTitle(product, currentLocale),
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
      const nextQty = (currentItem.quantity || 1) + delta
      if (nextQty < 1) return prev

      return { ...prev, [slotKey]: { ...currentItem, quantity: nextQty } }
    })
  }

  const { totalPrice, totalOriginalPrice } = useMemo(() => {
    if (!mounted) return { totalPrice: 0, totalOriginalPrice: 0 }
    return calculateBuildTotals(selections)
  }, [selections, mounted])

  const handleWhatsAppBuildOrder = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!buyerNumber.trim()) {
      alert(phoneErrorLabel[currentLocale] || phoneErrorLabel.en)
      return
    }
    if (Object.keys(selections).length === 0) {
      alert(emptySelectionAlert)
      return
    }

    const waMessageText = buildWhatsAppOrderMessage({
      buildName: 'Custom PC Build',
      selections,
      componentSlots: COMPONENT_SLOTS,
      totalPrice,
      exchangeRate: dynamicExchangeRate,
      buyerNumber,
      currentLocale,
      getLocalizedTitle,
      originUrl: window.location.origin,
    })

    sendWhatsAppOrder(waMessageText)
  }

  const handleAddToCartDefault = (prod: any) => {
    const result = addProductToCart(prod, currentLocale, getLocalizedTitle)
    setMessage(result)
    if (result.type === 'success') closeModal()
  }

  const t = dict[currentLocale] || dict['en']
  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(currentLocale)

  // Use provided fonts or fallback
  const titleFont =
    headingFont ||
    (isRegionalLocale
      ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
  const bodyFontFamily =
    bodyFont ||
    (isRegionalLocale
      ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')

  // Use provided colors or fallbacks
  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'

  const hasSelections = Object.keys(selections).length > 0

  return (
    <>
      {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}

      <div
        className={styles['pc-builder-container']}
        style={
          {
            '--font-family': bodyFontFamily,
            '--heading-font': titleFont,
            '--pc-heading-color': headingColor,
            '--pc-body-color': textColor,
            direction: isRtl ? 'rtl' : 'ltr',
            textAlign: isRtl ? 'right' : 'left',
          } as React.CSSProperties
        }
      >
        <header className={styles['pc-builder-header']}>
          <h1
            className={styles['pc-builder-title']}
            style={{
              fontFamily: 'var(--heading-font)',
              color: 'var(--pc-heading-color)',
            }}
          >
            {t.title}
          </h1>
          <p
            className={styles['pc-builder-subtitle']}
            style={{
              fontFamily: 'var(--font-family)',
              color: 'var(--pc-body-color)',
            }}
          >
            {t.subtitle}
          </p>
        </header>

        {message.text && (
          <div
            className={`${styles['pc-builder-alert']} ${message.type ? styles[message.type] : ''}`}
            style={{ color: 'var(--pc-body-color)' }}
          >
            {message.text}
          </div>
        )}

        {mounted && hasSelections && (
          <div className={`${styles['pc-builder-clear-all-row']} ${isRtl ? styles.rtl : ''}`}>
            <button
              type="button"
              onClick={triggerClearAllRequest}
              className={`${styles['pc-builder-btn']} ${styles.clear} ${styles['pc-builder-clear-all-btn']}`}
              style={{
                fontFamily: 'var(--font-family)',
                color: 'var(--pc-body-color)',
              }}
            >
              {pickLocale(clearAllLabel, currentLocale)}
            </button>
          </div>
        )}

        <div className={styles['pc-builder-layout-grid']}>
          <div className={styles['pc-builder-slots-list']}>
            {COMPONENT_SLOTS.map((slot) => (
              <ComponentSlotCard
                key={slot.key}
                slot={slot}
                chosenItem={mounted ? selections[slot.key] : null}
                t={t}
                getLocalizedTitle={getLocalizedTitle}
                onOpen={openModal}
                onRemove={removeComponent}
                onQuantityChange={updateSlotQuantity}
                titleColor={titleColor}
                bodyColor={bodyColor}
                headingFont={headingFont}
                bodyFont={bodyFont}
              />
            ))}
          </div>

          <BuildSummarySidebar
            t={t}
            currentLocale={currentLocale}
            mounted={mounted}
            totalPrice={totalPrice}
            totalOriginalPrice={totalOriginalPrice}
            dynamicExchangeRate={dynamicExchangeRate}
            buyerNumber={buyerNumber}
            setBuyerNumber={setBuyerNumber}
            hasSelections={hasSelections}
            onSubmit={handleWhatsAppBuildOrder}
            fontFam={bodyFontFamily}
            titleColor={titleColor}
            bodyColor={bodyColor}
          />
        </div>

        {activeModalSlot && (
          <ProductPickerModal
            activeModalSlot={activeModalSlot}
            products={products}
            currentLocale={currentLocale}
            labels={{ modalSelectPrefix: t.modalSelectPrefix, noItems: t.noItems }}
            selections={selections}
            getLocalizedTitle={getLocalizedTitle}
            onSelect={selectComponent}
            onAddToCart={handleAddToCartDefault}
            onClose={closeModal}
            titleColor={titleColor}
            bodyColor={bodyColor}
            headingFont={headingFont}
            bodyFont={bodyFont}
          />
        )}

        {showClearConfirmModal && (
          <ClearConfirmModal
            currentLocale={currentLocale}
            isRtl={isRtl}
            fontFam={bodyFontFamily}
            titleColor={titleColor}
            bodyColor={bodyColor}
            onConfirm={confirmClearAllComponents}
            onCancel={() => setShowClearConfirmModal(false)}
          />
        )}
      </div>
    </>
  )
}
