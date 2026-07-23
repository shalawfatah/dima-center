'use client'

import React, { useState } from 'react'
import styles from '@/styles/whatsapp.module.css'

interface WhatsappWindowProps {
  phoneNumber: string // Format with country code, e.g. "9647501234567"
  businessName?: string
  avatarUrl?: string
  onClose: () => void
}

export const WhatsappWindow: React.FC<WhatsappWindowProps> = ({
  phoneNumber,
  businessName = 'Customer Support',
  avatarUrl = '/whatsapp-avatar.png',
  onClose,
}) => {
  const [message, setMessage] = useState('')

  const handleSendMessage = (e: React.SubmitEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Clean phone number (remove +, spaces, dashes)
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
    const encodedMsg = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    setMessage('')
  }

  return (
    <div className={styles.windowContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.avatarWrapper}>
            <img src={avatarUrl} alt={businessName} className={styles.avatar} />
            <span className={styles.onlineDot} />
          </div>
          <div>
            <h4 className={styles.title}>{businessName}</h4>
            <p className={styles.subtitle}>Typically replies in a few minutes</p>
          </div>
        </div>
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
          ✕
        </button>
      </div>

      {/* Message Area */}
      <div className={styles.chatBody}>
        <div className={styles.bubble}>
          <p className={styles.bubbleText}>Hello! 👋 How can we help you today?</p>
          <span className={styles.bubbleTime}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Footer Form */}
      <form onSubmit={handleSendMessage} className={styles.footer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button type="submit" className={styles.sendBtn} aria-label="Send message">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
