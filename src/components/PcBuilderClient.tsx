'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalStorageState } from '../utils/pc_build_local_storage'
import { COMPONENT_SLOTS, dict, PcBuilderClientProps } from '@/utils/pc_build_items'
import Image from 'next/image'

export default function PcBuilderClient({
  products,
  user,
  currentLocale,
  isRtl,
}: PcBuilderClientProps) {
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

  // Next.js localization check (Fix tracking for 'ckb')
  const isRegionalLocale =
    currentLocale === 'ar' || currentLocale === 'ku' || currentLocale === 'ckb'

  // Dynamic Font Families explicitly mapped out as requested
  const titleFontFamily = isRegionalLocale
    ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  const generalFontFamily = isRegionalLocale
    ? '"Rudaw", "Inter", "Noto Sans Arabic", -apple-system, sans-serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

  const t = dict[currentLocale] || dict['en']

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 1.5rem',
        direction: isRtl ? 'rtl' : 'ltr',
        textAlign: isRtl ? 'right' : 'left',
        fontFamily: generalFontFamily,
      }}
    >
      <header
        style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}
      >
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            margin: 0,
            color: '#000',
            fontFamily: titleFontFamily, // Applied 'Rudaw'
          }}
        >
          {t.title}
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontFamily: generalFontFamily }}>
          {t.subtitle}
        </p>
      </header>

      {message.text && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '6px',
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#15803d' : '#b91c1c',
            fontWeight: '500',
            fontFamily: generalFontFamily,
          }}
        >
          {message.text}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: COMPONENTS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {COMPONENT_SLOTS.map((slot) => {
            const chosenItem = selections[slot.key]

            return (
              <div
                key={slot.key}
                onClick={() => openModal(slot.key)}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  background: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-in-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '6px',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {chosenItem?.meta?.image?.url ? (
                      <Image
                        height={100}
                        width={100}
                        src={chosenItem.meta.image.url}
                        alt={chosenItem.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#94a3b8',
                          fontWeight: 'bold',
                          fontFamily: generalFontFamily,
                        }}
                      >
                        {t.partLabel}
                      </span>
                    )}
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        display: 'block',
                        fontFamily: generalFontFamily,
                      }}
                    >
                      {/* Dynamic loop fallback support would typically use translation objects for slot names */}
                      {slot.label}
                    </span>
                    {chosenItem ? (
                      <div
                        style={{
                          marginTop: '0.15rem',
                          fontWeight: '600',
                          fontSize: '16px',
                          color: '#000',
                          fontFamily: generalFontFamily,
                        }}
                      >
                        {chosenItem.title}{' '}
                        <span
                          style={{
                            color: '#10b981',
                            marginLeft: isRtl ? '0' : '8px',
                            marginRight: isRtl ? '8px' : '0',
                          }}
                        >
                          ({chosenItem.price} IQD)
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: '0.15rem',
                          color: '#cbd5e1',
                          fontStyle: 'italic',
                          fontSize: '14px',
                          fontFamily: generalFontFamily,
                        }}
                      >
                        {t.noPart}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {chosenItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Stops modal window popping up on button interaction triggers
                        removeComponent(slot.key)
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        fontFamily: generalFontFamily,
                      }}
                    >
                      {t.clear}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openModal(slot.key)
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#f1f5f9',
                      color: '#334155',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      fontFamily: generalFontFamily,
                    }}
                  >
                    {chosenItem ? t.change : t.choose}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT COLUMN: SUMMARY CONTAINER PANEL */}
        <div
          style={{
            position: 'sticky',
            top: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.5rem',
              background: '#fff',
            }}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '18px',
                fontWeight: '700',
                color: '#000',
                fontFamily: generalFontFamily,
              }}
            >
              {t.summary}
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  display: 'block',
                  marginBottom: '4px',
                  fontFamily: generalFontFamily,
                }}
              >
                {t.configName}
              </label>
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#000',
                  fontSize: '14px',
                  fontFamily: generalFontFamily,
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <span style={{ fontSize: '14px', color: '#64748b', fontFamily: generalFontFamily }}>
                {t.totalPrice}
              </span>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#10b981',
                  fontFamily: generalFontFamily,
                }}
              >
                {totalPrice} IQD
              </span>
            </div>

            {user ? (
              <button
                onClick={handleSaveBuild}
                disabled={isSaving || Object.keys(selections).length === 0}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: Object.keys(selections).length === 0 ? 'not-allowed' : 'pointer',
                  opacity: Object.keys(selections).length === 0 || isSaving ? 0.6 : 1,
                  fontFamily: generalFontFamily,
                }}
              >
                {isSaving ? t.saving : t.saveBtn}
              </button>
            ) : (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '10px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#64748b',
                  fontFamily: generalFontFamily,
                }}
              >
                {t.loginPrompt} <br />
                <a
                  href={`/${currentLocale}/login`}
                  style={{
                    color: '#3b82f6',
                    fontWeight: '600',
                    textDecoration: 'underline',
                    fontFamily: generalFontFamily,
                  }}
                >
                  {t.signIn}
                </a>{' '}
                {t.saveSuffix}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OVERLAY SELECTION MODAL WINDOW */}
      {activeModalSlot && currentSlotConfig && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#000',
                  fontFamily: generalFontFamily,
                }}
              >
                {t.modalSelectPrefix} {currentSlotConfig.label}
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontWeight: 'bold',
                }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '1.25rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {filteredProducts.length === 0 ? (
                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '2rem 0',
                    fontFamily: generalFontFamily,
                  }}
                >
                  {t.noItems} "{currentSlotConfig.categorySlug}".
                </p>
              ) : (
                filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => selectComponent(activeModalSlot, prod)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9'
                      e.currentTarget.style.borderColor = '#cbd5e1'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '6px',
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {prod.meta?.image?.url ? (
                          <Image
                            src={prod.meta.image.url}
                            height={100}
                            width={100}
                            alt={prod.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: '10px',
                              color: '#cbd5e1',
                              fontFamily: generalFontFamily,
                            }}
                          >
                            IMG
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontWeight: '600',
                          color: '#1e293b',
                          fontSize: '14px',
                          fontFamily: generalFontFamily,
                        }}
                      >
                        {prod.title}
                      </span>
                    </div>
                    <span
                      style={{
                        fontWeight: '700',
                        color: '#10b981',
                        fontSize: '15px',
                        fontFamily: generalFontFamily,
                      }}
                    >
                      {prod.price} IQD
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
