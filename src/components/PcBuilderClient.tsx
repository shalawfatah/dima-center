'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PcBuilderClientProps {
  products: any[]
  user: any | null
  currentLocale: string
  isRtl: boolean
}

// Explicit structural component slots mimicking PCPartPicker
const COMPONENT_SLOTS = [
  { key: 'cpu', label: 'Processor (CPU)' },
  { key: 'gpu', label: 'Graphics Card (GPU)' },
  { key: 'motherboard', label: 'Motherboard' },
  { key: 'ram', label: 'Memory (RAM)' },
  { key: 'storage', label: 'Storage (SSD/HDD)' },
  { key: 'psu', label: 'Power Supply (PSU)' },
  { key: 'case', label: 'Chassis / Case' },
  { key: 'cooler', label: 'CPU Cooler' },
]

export default function PcBuilderClient({
  products,
  user,
  currentLocale,
  isRtl,
}: PcBuilderClientProps) {
  const router = useRouter()
  const [buildName, setBuildName] = useState('My Dream Rig Build')
  const [selections, setSelections] = useState<Record<string, any>>({})
  const [activeSlot, setActiveSlot] = useState<string | null>('cpu')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Select a hardware component for the current slot
  const selectComponent = (slotKey: string, product: any) => {
    setSelections((prev) => ({
      ...prev,
      [slotKey]: product,
    }))
  }

  // Remove a component from a designated layout slot
  const removeComponent = (slotKey: string) => {
    setSelections((prev) => {
      const updated = { ...prev }
      delete updated[slotKey]
      return updated
    })
  }

  // Run dynamic reduction sums over selected state properties
  const totalPrice = Object.values(selections).reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  )

  // Send completed architecture back to Payload REST context paths
  const handleSaveBuild = async () => {
    if (!user) return
    setIsSaving(true)
    setMessage({ type: '', text: '' })

    // Build the payload payload body references
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

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 1.5rem',
        direction: isRtl ? 'rtl' : 'ltr',
        textAlign: isRtl ? 'right' : 'left',
      }}
    >
      <header
        style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}
      >
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: '#000' }}>
          Build Your Dream PC
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
          Mix and match components to build a custom desktop configuration.
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
        {/* LEFT COLUMN: ARCHITECTURAL COMPONENT SLOTS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {COMPONENT_SLOTS.map((slot) => {
            const chosenItem = selections[slot.key]
            const isCurrentlySelecting = activeSlot === slot.key

            return (
              <div
                key={slot.key}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  background: isCurrentlySelecting ? '#f8fafc' : '#fff',
                  borderColor: isCurrentlySelecting ? '#3b82f6' : '#e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#64748b',
                      textTransform: 'uppercase',
                    }}
                  >
                    {slot.label}
                  </span>
                  {chosenItem ? (
                    <div
                      style={{
                        marginTop: '0.25rem',
                        fontWeight: '600',
                        fontSize: '16px',
                      }}
                    >
                      {chosenItem.title}{' '}
                      <span style={{ color: '#10b981', marginLeft: '8px' }}>
                        ({chosenItem.price} IQD)
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: '0.25rem',
                        color: '#cbd5e1',
                        fontStyle: 'italic',
                        fontSize: '14px',
                      }}
                    >
                      No part selected
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {chosenItem && (
                    <button
                      onClick={() => removeComponent(slot.key)}
                      style={{
                        padding: '6px 12px',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setActiveSlot(slot.key)}
                    style={{
                      padding: '6px 12px',
                      background: isCurrentlySelecting ? '#3b82f6' : '#f1f5f9',
                      color: isCurrentlySelecting ? '#fff' : '#334155',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                    }}
                  >
                    {chosenItem ? 'Change' : 'Choose Part'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT COLUMN: PART SELECTION & PRICING BAR */}
        <div
          style={{
            position: 'sticky',
            top: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Active Product Selector catalog sub-box */}
          {activeSlot && (
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.25rem',
                background: '#fff',
              }}
            >
              <h3
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '15px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: '#475569',
                }}
              >
                Select {COMPONENT_SLOTS.find((s) => s.key === activeSlot)?.label}
              </h3>
              <div
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingRight: '4px',
                }}
              >
                {products.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '13px' }}>No catalog records matched.</p>
                ) : (
                  products.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => selectComponent(activeSlot, prod)}
                      style={{
                        textAlign: isRtl ? 'right' : 'left',
                        padding: '10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        transition: 'background 0.15s',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    >
                      <span style={{ fontWeight: '500', color: '#1e293b' }}>{prod.title}</span>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>{prod.price} IQD</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Checkout & Preserve Summary Panel Box */}
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '700' }}>
              Configuration Summary
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Configuration Name
              </label>
              <input
                type="text"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                borderTop: '1px solid #334155',
                paddingTop: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>Total Price:</span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
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
                }}
              >
                {isSaving ? 'Saving Blueprint...' : 'Save Configuration'}
              </button>
            ) : (
              <div
                style={{
                  background: '#1e293b',
                  padding: '10px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#cbd5e1',
                }}
              >
                💡 Want to save this layout? <br />
                <a
                  href={`/${currentLocale}/login`}
                  style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'underline' }}
                >
                  Sign in
                </a>{' '}
                to save blueprints.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
