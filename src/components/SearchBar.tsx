'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import styles from '@/styles/search.module.css'

const searchCache: Record<string, any[]> = {}

async function fetchSearchResults(query: string, locale: string) {
  const cacheKey = `${query.toLowerCase()}_${locale}`
  if (searchCache[cacheKey]) return searchCache[cacheKey]

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`)
    if (!res.ok) throw new Error('Search network request failed')

    const data = await res.json()
    const mappedData = Array.isArray(data) ? data : []
    searchCache[cacheKey] = mappedData
    return mappedData
  } catch (err) {
    console.error('Error fetching real-time search results:', err)
    return []
  }
}

function SearchIcon({ color = '#334155', size = 18 }: { color?: string; size?: number }) {
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

  const mobileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const segments = pathname.split('/')
  const locale = ['en', 'ar', 'ckb'].includes(segments[1]) ? segments[1] : initialLocale || 'en'
  const isRtl = locale === 'ar' || locale === 'ckb'

  // Debounced search logic
  useEffect(() => {
    const trimmed = searchTerm.trim()

    if (trimmed.length < 1) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const cacheKey = `${trimmed.toLowerCase()}_${locale}`

    if (searchCache[cacheKey]) {
      setResults(searchCache[cacheKey])
      setShowDropdown(true)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const delayDebounceFn = setTimeout(async () => {
      const data = await fetchSearchResults(trimmed, locale)
      setResults(data)
      setShowDropdown(true)
      setIsLoading(false)
    }, 250)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, locale])

  // Click outside to hide dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus mobile input on open
  useEffect(() => {
    if (isMobileOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50)
    }
  }, [isMobileOpen])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    router.push(`/${locale}/search?q=${encodeURIComponent(searchTerm.trim())}`)
    setIsMobileOpen(false)
    setShowDropdown(false)
  }

  const placeholders: Record<string, string> = {
    en: 'Search for CPUs, GPUs, laptops...',
    ar: 'ابحث عن معالجات، كروت شاشة، لابتوبات...',
    ckb: 'گەڕان بۆ پرۆسێسەر، کارتی شاشە، لاپتۆپ...',
  }

  const RenderSearchResults = () => {
    if (!showDropdown || searchTerm.trim().length < 1) return null

    // Helper function to safely extract localized or string values
    const getLocalizedText = (val: any) => {
      if (!val) return ''
      if (typeof val === 'string') return val
      if (typeof val === 'object') {
        return val[locale] || val.en || val.ckb || val.ar || Object.values(val)[0] || ''
      }
      return String(val)
    }

    // Helper function to resolve image URL from various API formats
    const getImageUrl = (item: any): string | null => {
      const img = item.image || item.thumbnail || item.media || item.featuredImage
      if (!img) return null
      if (typeof img === 'string') return img
      if (typeof img === 'object') {
        return img.url || img.sizes?.thumbnail?.url || img.sizes?.card?.url || null
      }
      return null
    }

    return (
      <div className={styles.searchResultsDropdown}>
        {isLoading ? (
          <div className={styles.searchStatusItem}>Loading...</div>
        ) : results.length > 0 ? (
          <ul className={styles.resultsList}>
            {results.map((item, idx) => {
              const displayTitle = getLocalizedText(item.title || item.name)
              const displayPrice =
                typeof item.price === 'object' ? getLocalizedText(item.price) : item.price
              const imageUrl = getImageUrl(item)

              return (
                <li
                  key={item.id || idx}
                  className={styles.resultsItem}
                  onClick={() => {
                    const category = item.categorySlug || 'product' // Fallback if missing
                    const productIdentifier = item.slug || item.id

                    router.push(`/${locale}/${category}/${productIdentifier}`)
                    setShowDropdown(false)
                    setIsMobileOpen(false)
                  }}
                >
                  <div className={styles.resultsLeftCol}>
                    <span className={styles.resultTitle}>{displayTitle}</span>
                  </div>
                  <div className={styles.resultsRightCol}>
                    {displayPrice && <span className={styles.resultPrice}>{displayPrice}</span>}
                    {imageUrl && (
                      <div className={styles.thumbWrapper}>
                        <img src={imageUrl} alt={displayTitle} className={styles.resultThumb} />
                      </div>
                    )}
                  </div>
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
      {/* 📱 Mobile Toggle Icon Button with #ffcb6b Background */}
      <button
        type="button"
        aria-label="Toggle search"
        className={styles.searchMobileToggleBtn}
        onClick={() => setIsMobileOpen((prev) => !prev)}
      >
        <SearchIcon color="#1e293b" size={20} />
      </button>

      {/* 💻 Desktop Form */}
      <form onSubmit={handleSearchSubmit} className={styles.searchFormDesktop}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholders[locale] || placeholders.en}
          className={styles.desktopInput}
          onFocus={() => setShowDropdown(searchTerm.trim().length >= 1)}
        />
        <button
          type="submit"
          className={styles.desktopSubmitBtn}
          style={{ [isRtl ? 'left' : 'right']: '12px' }}
        >
          <SearchIcon color="#808080" size={16} />
        </button>
        <RenderSearchResults />
      </form>

      {/* 📱 Mobile Overlay */}
      <div
        className={`${styles.searchMobileOverlay} ${isMobileOpen ? styles.isActive : ''}`}
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        <div className={styles.mobileFormWrapper}>
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, position: 'relative' }}>
            <input
              ref={mobileInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholders[locale] || placeholders.en}
              className={styles.mobileInput}
            />
            <button
              type="submit"
              className={styles.desktopSubmitBtn}
              style={{ [isRtl ? 'left' : 'right']: '10px' }}
            >
              <SearchIcon color="#475569" size={16} />
            </button>
          </form>
          <button
            type="button"
            className={styles.mobileCloseBtn}
            onClick={() => setIsMobileOpen(false)}
          >
            ✕
          </button>
        </div>
        <RenderSearchResults />
      </div>
    </div>
  )
}
