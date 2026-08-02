'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from '@/styles/whatsapp.module.css'

interface WhatsappWindowProps {
  phoneNumber: string // Format with country code, e.g. "9647501234567"
  businessName?: string
  avatarUrl?: string
  locale?: string
  onClose: () => void
  headingFont?: string
  bodyFont?: string
}

export const WhatsappWindow: React.FC<WhatsappWindowProps> = ({
  phoneNumber,
  businessName,
  avatarUrl = '/dima.ico', // Updated to favicon/icon path
  locale: propLocale,
  onClose,
  headingFont,
  bodyFont,
}) => {
  const [message, setMessage] = useState('')
  const pathname = usePathname()

  // Detect locale from route if not explicitly passed as prop
  const segments = pathname ? pathname.split('/') : []
  const locale = propLocale || (['en', 'ar', 'ckb'].includes(segments[1]) ? segments[1] : 'en')
  const isRtl = locale === 'ar' || locale === 'ckb'

  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(locale)
  const titleFont = headingFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')
  const bodyFontFamily = bodyFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')

  // Localized Strings
  const translations: Record<
    string,
    { businessName: string; greeting: string; placeholder: string }
  > = {
    en: {
      businessName: 'Dima Center Support',
      greeting: "Hello! 👋 How can we help you, let's chat through WhatsApp!",
      placeholder: 'Type a message...',
    },
    ckb: {
      businessName: 'سەنتەری دیما',
      greeting: 'سڵاو! 👋 پێویستت بە یارمەتییە، دەتوانین بە وەتسئاپ لەگەڵتابین',
      placeholder: 'پەیامێک بنووسە...',
    },
    ar: {
      businessName: 'دعم مركز دیما',
      greeting: 'مرحباً! 👋 كيف يمكننا مساعدتك؟ يسعدنا التواصل معك عبر واتساب!',
      placeholder: 'اكتب رسالة...',
    },
  }

  const currentText = translations[locale] || translations.en
  // Use passed businessName only if explicitly provided, otherwise fallback to localized name
  const resolvedBusinessName = businessName || currentText.businessName

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
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
    <div
      className={styles.windowContainer}
      style={
        {
          direction: isRtl ? 'rtl' : 'ltr',
          '--whatsapp-heading-font': titleFont,
          '--whatsapp-body-font': bodyFontFamily,
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.avatarWrapper}>
            <img src={avatarUrl} alt={resolvedBusinessName} className={styles.avatar} />
            <span className={styles.onlineDot} />
          </div>
          <div>
            <h4 className={styles.title} style={{ fontFamily: 'var(--whatsapp-heading-font)' }}>
              {resolvedBusinessName}
            </h4>
          </div>
        </div>
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
          ✕
        </button>
      </div>

      {/* Message Area */}
      <div className={styles.chatBody}>
        <div className={styles.bubble}>
          <p className={styles.bubbleText} style={{ fontFamily: 'var(--whatsapp-body-font)' }}>
            {currentText.greeting}
          </p>
          <span className={styles.bubbleTime} style={{ fontFamily: 'var(--whatsapp-body-font)' }}>
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
          placeholder={currentText.placeholder}
          className={styles.input}
          style={{ fontFamily: 'var(--whatsapp-body-font)' }}
        />
        <button type="submit" className={styles.sendBtn} aria-label="Send message">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
