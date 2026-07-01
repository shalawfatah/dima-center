'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface LanguagesProps {
  currentLocale: string
}

export default function Languages({ currentLocale }: LanguagesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown if user clicks anywhere outside of it
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
    { code: 'ckb', label: 'کوردی', flag: '☀️' },
    { code: 'ar', label: 'العربية', flag: '🇮🇶' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ]

  // Find the active language object to show on the button
  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0]

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button - Optimized to be tiny and precise */}
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
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
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
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: '#94a3b8',
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown Menu Overlay - Remains comfortably wide for readable selection */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: currentLocale === 'en' ? 0 : 'auto',
            left: currentLocale === 'en' ? 'auto' : 0,
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            zIndex: 9999,
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
            minWidth: '150px', // Set back to a readable width for languages
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
                transition: 'background-color 0.15s ease',
                textAlign: lang.code === 'en' ? 'left' : 'right',
                flexDirection: lang.code === 'en' ? 'row' : 'row-reverse',
              }}
              className="lang-item"
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
