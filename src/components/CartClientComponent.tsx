'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { translations } from '@/utils/cart_translations'
import styles from '@/styles/cart_client.module.css'

interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  imageUrl?: string
}

interface CartClientComponentProps {
  currentLocale: string
  whatsappNumber?: string // 👈 Added dynamic WhatsApp number prop
}

// 🎯 Quick Iraqi phone helper
function normalizeIraqiNumber(number: string): string {
  let digits = number.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1) // drop leading 0
  if (!digits.startsWith('964')) digits = '964' + digits // add country code if missing
  return digits
}

export default function CartClientComponent({
  currentLocale,
  whatsappNumber = '9647701414269', // Fallback default
}: CartClientComponentProps) {
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
      setIsLoading(false)
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

    // 🟢 Dynamic WhatsApp number from props
    const cleanSellerNumber = normalizeIraqiNumber(whatsappNumber)
    const encodedMessage = encodeURIComponent(orderMessage)
    const waLink = `https://wa.me/${cleanSellerNumber}?text=${encodedMessage}`

    // 3. Open WhatsApp Web / App
    window.open(waLink, '_blank')
  }

  if (isLoading) {
    return <div className={styles.loadingContainer}>...</div>
  }

  return (
    <div
      className={styles.pageContainer}
      style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: regularFont }}
    >
      <h1 className={styles.heading} style={{ fontFamily: headingFont }}>
        {t.title}
      </h1>

      {cartItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛒</div>
          <p className={styles.emptyText}>{t.empty}</p>
          <Link href={`/${currentLocale}`} className={styles.continueLink}>
            {t.continue}
          </Link>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          <div className={styles.itemsList}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemImageWrapper}>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      width={85}
                      height={85}
                      alt={item.title}
                      className={styles.itemImage}
                    />
                  ) : (
                    <span className={styles.itemImagePlaceholder}>📦</span>
                  )}
                </div>

                <div className={styles.itemDetails} style={{ textAlign: isRtl ? 'right' : 'left' }}>
                  <h3 className={styles.itemTitle} style={{ fontFamily: headingFont }}>
                    {item.title}
                  </h3>
                  <div className={styles.itemPrice}>
                    {item.price.toLocaleString()} {t.currency}
                  </div>
                </div>

                <div className={styles.quantityControls}>
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className={styles.quantityButton}
                  >
                    -
                  </button>
                  <span className={styles.quantityValue}>({item.quantity})</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className={styles.removeButton}
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={clearCart}
              className={styles.clearButton}
              style={{ alignSelf: isRtl ? 'flex-start' : 'flex-end' }}
            >
              {t.clear}
            </button>
          </div>

          <div className={styles.summaryCard} style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <h2 className={styles.summaryTitle} style={{ fontFamily: headingFont }}>
              {t.summary}
            </h2>

            <div className={styles.summaryItemsList}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.summaryItemRow}>
                  <span className={styles.summaryItemName}>{item.title}</span>
                  <span className={styles.summaryItemQty}>{item.quantity}x</span>
                </div>
              ))}
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{t.subtotal}</span>
              <span className={styles.summaryTotal}>
                {totalAmount.toLocaleString()} {t.currency}
              </span>
            </div>

            {/* 🎯 Interactive Phone Form and WhatsApp CTA button */}
            <form onSubmit={handleWhatsAppCheckout} className={styles.checkoutForm}>
              <input
                type="tel"
                placeholder={t.phonePlaceholder}
                value={buyerNumber}
                onChange={(e) => setBuyerNumber(e.target.value)}
                required
                className={styles.phoneInput}
                style={{ fontFamily: regularFont }}
              />
              <button
                type="submit"
                className={styles.checkoutButton}
                style={{ fontFamily: headingFont }}
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
