'use client'

import React, { useState } from 'react'
import { createOrder } from '@/utils/createOrder'

interface OrderButtonProps {
  product: {
    title: string
    price: string
    url: string
  }
  currentLocale: string
}

// Localized UI labels
const phonePlaceholder: Record<string, string> = {
  ar: 'رقم الواتساب (مثال: 07701234567)',
  ckb: 'ژمارەی واتسئەپ (نموونە: 07701234567)',
  en: 'WhatsApp Number (e.g., 07701234567)',
}

const submitLabel: Record<string, string> = {
  ar: 'اطلب عبر واتساب 🛒',
  ckb: 'داواکردن لە ڕێگەی واتسئەپ 🛒',
  en: 'Order via WhatsApp 🛒',
}

const inputErrorLabel: Record<string, string> = {
  ar: 'يرجى إدخال رقم هاتفك لإتمام الطلب!',
  ckb: 'تکایە ژمارەی مۆبایلەکەت بنووسە بۆ داواکردن!',
  en: 'Please enter your phone number to complete the order!',
}

export default function OrderButton({ product, currentLocale }: OrderButtonProps) {
  const [buyerNumber, setBuyerNumber] = useState('')

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if (!buyerNumber.trim()) {
      alert(inputErrorLabel[currentLocale] || inputErrorLabel.en)
      return
    }

    // 1. Grab current quantity from the sidebar input
    const qtyInput = document.getElementById('qty-counter') as HTMLInputElement | null
    const quantity = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1

    // 2. Append the quantity to the product price string dynamically
    const dynamicPrice = `${product.price} [Qty: ${quantity}]`

    // 3. Generate WhatsApp Link
    const waLink = createOrder(
      {
        title: product.title,
        price: dynamicPrice,
        url: product.url,
      },
      buyerNumber,
    )

    // 4. Open WhatsApp
    window.open(waLink, '_blank')
  }

  return (
    <form
      onSubmit={handleOrder}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}
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
          fontSize: '15px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <button
        type="submit"
        style={{
          width: '100%',
          padding: '0.9rem',
          backgroundColor: '#25D366', // WhatsApp Green
          fontFamily: 'Rudaw',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1fbc54')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#25D366')}
      >
        {submitLabel[currentLocale] || submitLabel.en}
      </button>
    </form>
  )
}
