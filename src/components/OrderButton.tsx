'use client'

import { useState, type SubmitEvent } from 'react'
import { createOrder } from '@/utils/createOrder'
import { inputErrorLabel, phonePlaceholder, submitLabel } from '@/utils/order_btn_translations'
import { OrderButtonProps } from '@/types/types'
import styles from '@/styles/order_button.module.css'

export default function OrderButton({ product, currentLocale }: OrderButtonProps) {
  const [buyerNumber, setBuyerNumber] = useState('')

  const handleOrder = (e: SubmitEvent) => {
    e.preventDefault()

    if (!buyerNumber.trim()) {
      alert(inputErrorLabel[currentLocale] || inputErrorLabel.en)
      return
    }

    const qtyInput = document.getElementById('qty-counter') as HTMLInputElement | null
    const quantity = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1
    const dynamicPrice = `${product.price} [Qty: ${quantity}]`

    const waLink = createOrder(
      {
        title: product.title,
        price: dynamicPrice,
        url: product.url,
      },
      buyerNumber,
    )

    window.open(waLink, '_blank')
  }

  return (
    <form onSubmit={handleOrder} className={styles.orderForm}>
      <input
        type="tel"
        placeholder={phonePlaceholder[currentLocale] || phonePlaceholder.en}
        value={buyerNumber}
        onChange={(e) => setBuyerNumber(e.target.value)}
        required
        className={styles.phoneInput}
      />
      <button type="submit" className={styles.submitButton}>
        {submitLabel[currentLocale] || submitLabel.en}
      </button>
    </form>
  )
}
