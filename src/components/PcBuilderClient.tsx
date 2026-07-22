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

export default function PcBuilderClient({
  products,
  currentLocale,
  isRtl,
  generals,
}: PcBuilderClientProps & { generals?: GeneralSettingsData }) {
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
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)

  const dynamicExchangeRate = generals?.exchangeRate ?? 1500

  // Signal layout mounting sequence to prevent layout flashes
  useEffect(() => {
    setMounted(true)
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

  const handleWhatsAppBuildOrder = (e: React.FormEvent<HTMLFormElement>) => {
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
      buildName,
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
  const fontFam = isRegionalLocale
    ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  const hasSelections = Object.keys(selections).length > 0

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

      {mounted && hasSelections && (
        <div className={`${styles['pc-builder-clear-all-row']} ${isRtl ? styles.rtl : ''}`}>
          <button
            type="button"
            onClick={triggerClearAllRequest}
            className={`${styles['pc-builder-btn']} ${styles.clear} ${styles['pc-builder-clear-all-btn']}`}
            style={{ fontFamily: fontFam }}
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
            />
          ))}
        </div>

        <BuildSummarySidebar
          t={t}
          currentLocale={currentLocale}
          mounted={mounted}
          buildName={buildName}
          setBuildName={setBuildName}
          totalPrice={totalPrice}
          totalOriginalPrice={totalOriginalPrice}
          dynamicExchangeRate={dynamicExchangeRate}
          buyerNumber={buyerNumber}
          setBuyerNumber={setBuyerNumber}
          hasSelections={hasSelections}
          onSubmit={handleWhatsAppBuildOrder}
          fontFam={fontFam}
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
        />
      )}

      {showClearConfirmModal && (
        <ClearConfirmModal
          currentLocale={currentLocale}
          isRtl={isRtl}
          fontFam={fontFam}
          onConfirm={confirmClearAllComponents}
          onCancel={() => setShowClearConfirmModal(false)}
        />
      )}
    </div>
  )
}
