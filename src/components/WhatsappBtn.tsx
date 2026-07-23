'use client'

import React from 'react'
import styles from '@/styles/whatsapp.module.css'

interface WhatsappBtnProps {
  onClick: () => void
  isOpen: boolean
}

export const WhatsappBtn: React.FC<WhatsappBtnProps> = ({ onClick, isOpen }) => {
  return (
    <button onClick={onClick} className={styles.floatingBtn} aria-label="Toggle WhatsApp Chat">
      {isOpen ? (
        // Close Icon (X)
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        // WhatsApp Icon
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.98 9.98 0 004.779 1.221h.004c5.505 0 9.988-4.478 9.989-9.984.001-2.669-1.036-5.176-2.925-7.067C17.191 3.04 14.68 2 12.012 2zm5.825 14.167c-.244.686-1.42 1.309-1.956 1.368-.507.056-1.168.083-1.884-.146-.435-.139-.995-.325-1.72-.64-3.061-1.328-5.056-4.437-5.21-4.641-.151-.205-1.246-1.657-1.246-3.16 0-1.504.786-2.243 1.066-2.551.28-.308.61-.384.814-.384.204 0 .408.002.585.011.188.009.438-.071.686.524.253.606.864 2.109.939 2.263.076.155.127.336.026.541-.102.205-.153.333-.305.513-.153.18-.323.402-.461.541-.153.153-.313.32-.135.626.178.306.79 1.303 1.696 2.11 1.164 1.037 2.146 1.358 2.452 1.511.306.153.484.128.663-.077.179-.205.766-.895.97-1.202.204-.307.408-.255.687-.153.28.102 1.782.84 2.088.993.306.153.51.23.586.358.076.128.076.741-.168 1.427z" />
        </svg>
      )}
    </button>
  )
}
