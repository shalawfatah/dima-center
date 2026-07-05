'use client'

import React, { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CartItem, PaymentMethod } from './cart_types'

interface CartContextType {
  openCheckout: (item: CartItem) => void
  closeCheckout: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({
  children,
  user,
  currentLocale,
}: {
  children: React.ReactNode
  user: any | null
  currentLocale: string
}) {
  const router = useRouter()
  const [activeCheckoutItem, setActiveCheckoutItem] = useState<CartItem | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderStatus, setOrderStatus] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const openCheckout = (item: CartItem) => {
    // 🔐 Security Guardrail: Force user authentication before starting checkout
    if (!user) {
      alert('Please sign in to your account to place orders.')
      router.push(`/${currentLocale}/login`)
      return
    }
    setOrderStatus(null)
    setActiveCheckoutItem(item)
  }

  const closeCheckout = () => {
    if (!isSubmitting) {
      setActiveCheckoutItem(null)
    }
  }

  const handleSubmitOrder = async () => {
    if (!activeCheckoutItem || !user) return
    setIsSubmitting(true)

    // Match your Payload CMS collection payload parameters schema exactly
    const orderPayload = {
      user: user.id,
      paymentMethod: paymentMethod,
      total: activeCheckoutItem.price, // 👑 FIXED: Changed from Total to total
      orderType: activeCheckoutItem.isCustomBuild ? 'pc_build' : 'single_product',
      status: 'processing', // 👑 FIXED: Changed from Status to status (and using 'processing' since 'pending' isn't an option in your config)
      products: activeCheckoutItem.isCustomBuild ? [] : [activeCheckoutItem.id],
      pcBuildComponents: activeCheckoutItem.isCustomBuild ? activeCheckoutItem.components : null,
      customBuildName: activeCheckoutItem.buildName || null,
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      if (res.ok) {
        setOrderStatus({
          type: 'success',
          text: 'Order submitted successfully! Tracking added to dashboard.',
        })
        setTimeout(() => {
          if (activeCheckoutItem.isCustomBuild) {
            window.localStorage.removeItem('pc_build_selections')
          }
          setActiveCheckoutItem(null)
          router.push(`/${currentLocale}/account`)
        }, 2500)
      } else {
        setOrderStatus({
          type: 'error',
          text: 'Failed to record your order inside backend core ledger.',
        })
      }
    } catch (err) {
      setOrderStatus({ type: 'error', text: 'Networking pipeline error during submission.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CartContext.Provider value={{ openCheckout, closeCheckout }}>
      {children}

      {/* GLOBAL CHECKOUT MODAL WINDOW PORTAL ELEMENT */}
      {activeCheckoutItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={closeCheckout}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <header
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.75rem',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#000' }}>
                Secure Checkout
              </h3>
              {!isSubmitting && (
                <button
                  onClick={closeCheckout}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '22px',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  &times;
                </button>
              )}
            </header>

            {orderStatus ? (
              <div
                style={{
                  padding: '1.5rem 0',
                  textAlign: 'center',
                  color: orderStatus.type === 'success' ? '#15803d' : '#b91c1c',
                  fontWeight: '600',
                }}
              >
                {orderStatus.type === 'success' ? '🎉 ' : '❌ '} {orderStatus.text}
              </div>
            ) : (
              <div>
                {/* 🛠️ FIXED UI: Streamlined text summary containing no image and custom discount styling */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: '#000',
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {activeCheckoutItem.title}
                  </span>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {activeCheckoutItem.isCustomBuild
                        ? 'Custom Layout Configuration'
                        : 'Hardware Subsystem Component'}
                    </span>

                    <div style={{ textAlign: 'right' }}>
                      {activeCheckoutItem.isDiscounted && activeCheckoutItem.originalPrice ? (
                        <>
                          <span
                            style={{
                              fontSize: '12px',
                              textDecoration: 'line-through',
                              color: '#94a3b8',
                              marginRight: '8px',
                              fontWeight: '500',
                            }}
                          >
                            ${activeCheckoutItem.originalPrice}
                          </span>
                          <span style={{ fontWeight: '800', color: '#ef4444', fontSize: '16px' }}>
                            ${activeCheckoutItem.price}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}>
                          ${activeCheckoutItem.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Choose Payment Method Block */}
                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1.5rem 0' }}>
                  <legend
                    style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#475569',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Select Fulfillment Strategy
                  </legend>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        border: '1px solid',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: paymentMethod === 'cash_on_delivery' ? '#f0fdf4' : '#fff',
                        borderColor: paymentMethod === 'cash_on_delivery' ? '#10b981' : '#e2e8f0',
                      }}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={() => setPaymentMethod('cash_on_delivery')}
                        disabled={isSubmitting}
                        style={{ accentColor: '#10b981' }}
                      />
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px', color: '#000' }}>
                          Cash on Delivery (COD)
                        </strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          Pay in cash upon arrival at your specified delivery location.
                        </span>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px',
                        border: '1px solid',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: paymentMethod === 'in_store' ? '#f0fdf4' : '#fff',
                        borderColor: paymentMethod === 'in_store' ? '#10b981' : '#e2e8f0',
                      }}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value="in_store"
                        checked={paymentMethod === 'in_store'}
                        onChange={() => setPaymentMethod('in_store')}
                        disabled={isSubmitting}
                        style={{ accentColor: '#10b981' }}
                      />
                      <div>
                        <strong style={{ display: 'block', fontSize: '14px', color: '#000' }}>
                          In-Store Payment / Pickup
                        </strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          Reserve online and complete layout purchase inside our processing office
                          location.
                        </span>
                      </div>
                    </label>
                  </div>
                </fieldset>

                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '15px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting
                    ? 'Processing Ledger Records...'
                    : `Confirm & Submit Order (${activeCheckoutItem.price})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context)
    throw new Error(
      'useCart hook must be deployed directly underneath a parent CartProvider container wrapper.',
    )
  return context
}
