'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from '@/styles/languages.module.css'

interface LanguagesProps {
  currentLocale: string
}

// 🎯 Safe side-effect helper outside React's render/hook lifecycle
function setLocaleCookie(code: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`
  }
}

export default function Languages({ currentLocale }: LanguagesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

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
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  const handleLanguageChange = (code: string) => {
    setLocaleCookie(code)
    setIsOpen(false)
  }

  const getTargetHref = (targetCode: string) => {
    if (!pathname) return `/${targetCode}`
    const segments = pathname.split('/')
    segments[1] = targetCode
    return segments.join('/') || `/${targetCode}`
  }

  return (
    <div ref={dropdownRef} className={styles.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.trigger}
        aria-label="Change language"
      >
        <span className={styles.iconWrapper}>
          {isOpen ? (
            currentLang.flag
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#808080"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.globeIcon}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          )}
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className={`${styles.dropdown} ${isRtl ? styles.dropdownRtl : styles.dropdownLtr}`}>
          {languages.map((lang) => (
            <Link
              key={lang.code}
              href={getTargetHref(lang.code)}
              onClick={() => handleLanguageChange(lang.code)}
              className={`${styles.langLink} ${
                currentLocale === lang.code ? styles.langLinkActive : ''
              }`}
            >
              <span className={styles.langFlag}>{lang.flag}</span>
              <span className={styles.langLabel}>{lang.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
