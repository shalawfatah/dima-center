'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, FormEvent, useEffect, useRef } from 'react'
import styles from '@/styles/search.module.css'

// 🧠 Simple Client-Side In-Memory Cache Object to store search results
// key: "query_locale" -> value: results array
const searchCache: Record<string, any[]> = {}

// ⚡ DATABASE FETCH FUNCTION (Hits your custom Payload CMS API Route)
async function fetchSearchResults(query: string, locale: string) {
  const cacheKey = `${query.toLowerCase()}_${locale}`

  // 1. Check local memory cache first for immediate retrieval
  if (searchCache[cacheKey]) {
    return searchCache[cacheKey]
  }

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`)
    if (!res.ok) throw new Error('Search network request failed')

    const data = await res.json()
    const mappedData = Array.isArray(data) ? data : []

    // 2. Store results in cache for subsequent keystrokes
    searchCache[cacheKey] = mappedData
    return mappedData
  } catch (err) {
    console.error('Error fetching real-time search results:', err)
    return []
  }
}

// 🟢 Reusable, Minimalist 2D Flat SVG Search Icon Component
function SearchIcon({ color = '#f3f3f3', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export default function SearchBar({ locale: initialLocale }: { locale: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const segments = pathname.split('/')
  const locale = ['en', 'ar', 'ckb'].includes(segments[1]) ? segments[1] : initialLocale || 'en'
  const isRtl = locale === 'ar' || locale === 'ckb'

  // 🎯 Instant search logic using local cache + fast debouncing
  useEffect(() => {
    const trimmed = searchTerm.trim()

    // Reduced threshold to 1 character so search starts immediately
    if (trimmed.length < 1) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const cacheKey = `${trimmed.toLowerCase()}_${locale}`

    // 🏎️ INSTANT PATH: If we have the results cached locally, render them immediately
    if (searchCache[cacheKey]) {
      setResults(searchCache[cacheKey])
      setShowDropdown(true)
      setIsLoading(false)
      return
    }

    // 🌐 NETWORK PATH: If not in cache, fetch with a rapid 150ms debounce (down from 500ms)
    setIsLoading(true)
    const delayDebounceFn = setTimeout(async () => {
      const data = await fetchSearchResults(trimmed, locale)
      setResults(data)
      setShowDropdown(true)
      setIsLoading(false)
    }, 150) // 150ms is imperceptible to humans, but prevents spamming your API

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, locale])

  // Close dropdown if clicked outside of component container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    triggerSearchRedirect(searchTerm.trim())
  }

  const triggerSearchRedirect = (query: string) => {
    router.push(`/${locale}/search?q=${encodeURIComponent(query)}`)
    setIsMobileOpen(false)
    setShowDropdown(false)
  }

  useEffect(() => {
    if (isMobileOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isMobileOpen])

  const placeholders: Record<string, string> = {
    en: 'Search for CPUs, GPUs, laptops...',
    ar: 'ابحث عن معالجات، كروت شاشة، لابتوبات...',
    ckb: 'گەڕان بۆ پرۆسێسەر، کارتی شاشە، لاپتۆپ...',
  }

  // Common Results Dropdown UI component
  const RenderSearchResults = () => {
    // Show dropdown starting from 1 character
    if (!showDropdown || searchTerm.trim().length < 1) return null

    return (
      <div className={styles.searchResultsDropdown} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        {isLoading ? (
          <div className={styles.searchStatusItem}>Loading...</div>
        ) : results.length > 0 ? (
          <ul className={styles.resultsList}>
            {results.map((item) => {
              const displayName = item.title || item.name || ''
              return (
                <li
                  key={item.id}
                  onClick={() => {
                    setSearchTerm(displayName)
                    triggerSearchRedirect(displayName)
                  }}
                  className={styles.resultsItem}
                >
                  <SearchIcon color="#64748b" size={14} /> {displayName}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className={styles.searchStatusItem}>No results found</div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.searchComponentRoot} ref={containerRef}>
      <button
        type="button"
        className={styles.searchMobileToggleBtn}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? '✕' : <SearchIcon color="#f3f3f3" size={18} />}
      </button>

      {/* MOBILE OVERLAY DROPDOWN */}
      <div className={`${styles.searchMobileOverlay} ${isMobileOpen ? styles.isActive : ''}`}>
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', position: 'relative', width: '100%' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholders[locale] || placeholders.en}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '15px',
              borderRadius: '8px',
              border: '1px solid #3b82f6',
              outline: 'none',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              paddingInlineEnd: '45px',
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              [isRtl ? 'left' : 'right']: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            <SearchIcon color="#f3f3f3" size={18} />
          </button>
        </form>
        <RenderSearchResults />
      </div>

      {/* DESKTOP SEARCH BAR */}
      <form onSubmit={handleSearchSubmit} className={styles.searchFormDesktop}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholders[locale] || placeholders.en}
          style={{
            width: '100%',
            padding: '0.75rem 1.2rem',
            fontSize: '14px',
            borderRadius: '9999px',
            border: '1px solid #cbd5e1',
            outline: 'none',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            transition: 'all 0.15s ease',
            paddingInlineEnd: '44px',
            fontFamily: locale === 'en' ? 'inherit' : '"Rudaw", sans-serif',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)'
            setShowDropdown(searchTerm.trim().length >= 1)
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <button
          type="submit"
          style={{
            position: 'absolute',
            [isRtl ? 'left' : 'right']: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          <SearchIcon color="#f3f3f3" size={16} />
        </button>
        <RenderSearchResults />
      </form>
    </div>
  )
}
