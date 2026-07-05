'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalStorageState } from '../utils/pc_build_local_storage'
import { COMPONENT_SLOTS, dict, PcBuilderClientProps } from '@/utils/pc_build_items'
import Image from 'next/image'
import { fallbackCatalog } from '@/utils/fallback_catalog'
import { GeneralSettingsData } from '@/types/types'
import ProductPickerModal from './ProductPickerModal'
import styles from '@/styles/pc_builder.module.css'

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

    const rawTitle = product.title || ''
    if (fallbackCatalog[rawTitle]) {
      return fallbackCatalog[rawTitle][currentLocale as 'en' | 'ar' | 'ckb'] || rawTitle
    }
    return rawTitle
  }

  const getExchangeLabel = (): string => {
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

      if (existing) {
        existing.quantity += 1
      } else {
        cart.push({
          id: prod.id,
          title: getLocalizedTitle(prod),
          price: prod.price,
          quantity: 1,
          imageUrl: prodProductImg,
        })
      }
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))

      // Inline messaging banner feedback replacement
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
                    <span className={styles['pc-builder-slot-label']}>{slot.label}</span>
                    {chosenItem ? (
                      <div className={styles['pc-builder-chosen-title']}>
                        {getLocalizedTitle(chosenItem)}
                        <span className={styles['pc-builder-chosen-price']}>
                          (${chosenItem.price})
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
              <span className={styles['pc-builder-price-value']}>
                ${totalPrice.toLocaleString()}
              </span>
            </div>

            {user ? (
              <button
                onClick={handleSaveBuild}
                disabled={isSaving || Object.keys(selections).length === 0}
                className={styles['pc-builder-submit-btn']}
                style={{
                  cursor: Object.keys(selections).length === 0 ? 'not-allowed' : 'pointer',
                  opacity: Object.keys(selections).length === 0 || isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? t.saving : t.saveBtn}
              </button>
            ) : (
              <div className={styles['pc-builder-auth-notice']}>
                {t.loginPrompt} <br />
                <a href={`/${currentLocale}/login`} className={styles['pc-builder-auth-link']}>
                  {t.signIn}
                </a>{' '}
                {t.saveSuffix}
              </div>
            )}
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
