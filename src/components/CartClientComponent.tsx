'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  imageUrl?: string
}

interface TranslationBundle {
  title: string
  empty: string
  continue: string
  summary: string
  subtotal: string
  currency: string
  clear: string
  checkout: string
  phonePlaceholder: string
  phoneError: string
}

interface CartClientComponentProps {
  currentLocale: string
}

// 🎯 Quick Iraqi phone helper
function normalizeIraqiNumber(number: string): string {
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1) // drop leading 0
  if (!digits.startsWith('964')) digits = '964' + digits // add country code if missing
  return digits
}

export default function CartClientComponent({ currentLocale }: CartClientComponentProps) {
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [buyerNumber, setBuyerNumber] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setCartItems(parsed)
        }
      }
    } catch (err) {
      console.error('Error reading cart data:', err)
    } finally {
      setIsLoading(false) // 👈 Changed from isLoading(false) to setIsLoading(false)
    }
  }, [])
  const saveCart = (updatedItems: CartItem[]) => {
    setCartItems(updatedItems)
    localStorage.setItem('cart', JSON.stringify(updatedItems))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const nextQty = item.quantity + delta
          return { ...item, quantity: nextQty }
        }
        return item
      })
      .filter((item) => item.quantity > 0)
    saveCart(updated)
  }

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id)
    saveCart(updated)
  }

  const clearCart = () => {
    saveCart([])
  }

  const translations: Record<'en' | 'ar' | 'ckb', TranslationBundle> = {
    en: {
      title: 'Your Shopping Cart',
      empty: 'Your cart is completely empty.',
      continue: 'Continue Shopping',
      summary: 'Order Summary',
      subtotal: 'Total Amount',
      currency: 'USD',
      clear: 'Clear Cart',
      checkout: 'Order via WhatsApp 🛒',
      phonePlaceholder: 'Enter your WhatsApp number (e.g. 07701234567)',
      phoneError: 'Please enter your WhatsApp number to complete the order!',
    },
    ar: {
      title: 'حقيبة التسوق الخاصة بك',
      empty: 'حقيبة التسوق فارغة تماماً.',
      continue: 'متابعة التسوق',
      summary: 'ملخص الطلب',
      subtotal: 'المجموع الكلي',
      currency: 'دۆلار',
      clear: 'تفريغ السلة',
      checkout: 'اطلب عبر واتساب 🛒',
      phonePlaceholder: 'أدخل رقم الواتساب الخاص بك (مثال: 07701234567)',
      phoneError: 'يرجى إدخال رقم هاتف الواتساب الخاص بك لإرسال الطلب!',
    },
    ckb: {
      title: 'سەبەتەی کڕینەکەت',
      empty: 'سەبەتەکەت چۆڵە.',
      continue: 'بەردەوامبوون لە کڕین',
      summary: 'پوختەی داواکاری',
      subtotal: 'کۆ گشتی',
      currency: 'دۆلار',
      clear: 'سڕینەوەی سەبەتە',
      checkout: 'داواکردن لە ڕێگەی واتسئەپ 🛒',
      phonePlaceholder: 'ژمارەی واتسئەپەکەت بنووسە (نموونە: 07701234567)',
      phoneError: 'تکایە ژمارەی واتسئەپەکەت بنووسە بۆ ناردنی داواکارییەکە!',
    },
  }

  const validLocale = (
    translations[currentLocale as 'en' | 'ar' | 'ckb'] ? currentLocale : 'en'
  ) as 'en' | 'ar' | 'ckb'
  const t = translations[validLocale]

  const isRegionalLocale = currentLocale === 'ar' || currentLocale === 'ckb'
  const headingFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'system-ui, sans-serif'
  const regularFont = isRegionalLocale ? '"Sarchia", sans-serif' : 'system-ui, sans-serif'

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // 🎯 Handles gathering all cart items, building the text list, and redirecting.
  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault()

    if (!buyerNumber.trim()) {
      alert(t.phoneError)
      return
    }

    // 1. Build a clean formatted item manifest list
    const itemsText = cartItems
      .map(
        (item, index) =>
          `${index + 1}. *${item.title}*\n` +
          `   Qty: ${item.quantity} × ${item.price.toLocaleString()} ${t.currency}\n` +
          `   Link: ${window.location.origin}/${currentLocale}/products/${item.id}`,
      )
      .join('\n\n')

    // 2. Draft the complete WhatsApp message template
    const orderMessage =
      `New cart order request 🛒\n\n` +
      `${itemsText}\n\n` +
      `---------------------------\n` +
      `*Total Amount:* ${totalAmount.toLocaleString()} ${t.currency}\n` +
      `*Buyer Number:* ${buyerNumber}`

    const sellerNumber = '9647701414269'
    const cleanSellerNumber = normalizeIraqiNumber(sellerNumber)
    const encodedMessage = encodeURIComponent(orderMessage)
    const waLink = `https://wa.me/${cleanSellerNumber}?text=${encodedMessage}`

    // 3. Open WhatsApp Web / App
    window.open(waLink, '_blank')
  }

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>...</div>
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '2rem max(1.5rem, calc((100% - 1800px) / 2))',
        direction: isRtl ? 'rtl' : 'ltr',
        fontFamily: regularFont,
      }}
    >
      <h1
        style={{
          fontFamily: headingFont,
          fontSize: '2rem',
          fontWeight: '800',
          marginBottom: '2rem',
          color: '#111',
        }}
      >
        {t.title}
      </h1>

      {cartItems.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            border: '1px solid #eef0f2',
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1.5rem' }}>{t.empty}</p>
          <Link
            href={`/${currentLocale}`}
            style={{
              display: 'inline-block',
              background: '#0070f3',
              color: '#fff',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontFamily: 'Rudaw',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            {t.continue}
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  border: '1px solid #eef0f2',
                }}
              >
                <div
                  style={{
                    width: '85px',
                    height: '85px',
                    background: '#f5f7f9',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      width={85}
                      height={85}
                      alt={item.title}
                      style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <span style={{ fontSize: '1.5rem' }}>📦</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0, textAlign: isRtl ? 'right' : 'left' }}>
                  <h3
                    style={{
                      fontFamily: headingFont,
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: '0 0 0.4rem 0',
                      color: '#111',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </h3>
                  <div style={{ color: '#0070f3', fontWeight: '700', fontSize: '1.05rem' }}>
                    {item.price.toLocaleString()} {t.currency}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    direction: 'ltr',
                  }}
                >
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '1px solid #ddd',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '1px solid #ddd',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff3b30',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '0.5rem',
                  }}
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={clearCart}
              style={{
                alignSelf: isRtl ? 'flex-start' : 'flex-end',
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline',
              }}
            >
              {t.clear}
            </button>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              border: '1px solid #eef0f2',
              textAlign: isRtl ? 'right' : 'left',
            }}
          >
            <h2
              style={{
                fontFamily: headingFont,
                fontSize: '1.25rem',
                fontWeight: '700',
                marginBottom: '1.25rem',
              }}
            >
              {t.summary}
            </h2>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid #eee',
                marginBottom: '1.5rem',
                gap: '1rem',
              }}
            >
              <span style={{ color: '#666' }}>{t.subtotal}</span>
              <span style={{ fontWeight: '800', fontSize: '1.3rem', color: '#000' }}>
                {totalAmount.toLocaleString()} {t.currency}
              </span>
            </div>

            {/* 🎯 Interactive Phone Form and WhatsApp CTA button */}
            <form
              onSubmit={handleWhatsAppCheckout}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <input
                type="tel"
                placeholder={t.phonePlaceholder}
                value={buyerNumber}
                onChange={(e) => setBuyerNumber(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: regularFont,
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#25D366', // WhatsApp Green
                  color: '#fff',
                  padding: '1rem',
                  borderRadius: '10px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background-color 0.2s',
                  fontFamily: headingFont,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1fbc54')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#25D366')}
              >
                {t.checkout}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
