'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface LanguagesProps {
  currentLocale: string
}

export default function Languages({ currentLocale }: LanguagesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const languages = [
    { code: 'ckb', label: 'کوردی', flag: '🇹🇯' },
    { code: 'ar', label: 'العربية', flag: '🇮🇶' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ]

  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0]

  // 🌍 Check if the layout direction is Right-to-Left
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '4px 8px',
          borderRadius: '20px',
          cursor: 'pointer',
          outline: 'none',
          color: '#fff',
        }}
      >
        <span style={{ fontSize: '16px', lineHeight: '1' }}>{currentLang.flag}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: '#94a3b8',
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            // 🎯 Dynamic alignment:
            // In LTR (English on the right side), anchor to the right edge and grow left.
            // In RTL (Kurdish/Arabic on the left side), anchor to the left edge and grow right.
            right: isRtl ? 'auto' : 0,
            left: isRtl ? 0 : 'auto',
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            zIndex: 9999,
            borderRadius: '12px',
            minWidth: '150px',
            overflow: 'hidden',
            padding: '4px',
          }}
        >
          {languages.map((lang) => (
            <Link
              key={lang.code}
              href={`/${lang.code}`}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                textDecoration: 'none',
                fontSize: '14px',
                color: currentLocale === lang.code ? '#3b82f6' : '#cbd5e1',
                fontWeight: currentLocale === lang.code ? '600' : '500',
                borderRadius: '8px',
                flexDirection: 'row',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ fontSize: '16px' }}>{lang.flag}</span>
              <span style={{ flex: 1 }}>{lang.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
