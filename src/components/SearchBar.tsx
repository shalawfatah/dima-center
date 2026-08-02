'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import styles from '@/styles/search.module.css'
import Image from 'next/image'

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

interface SearchResultsDropdownProps {
  showDropdown: boolean
  searchTerm: string
  isLoading: boolean
  results: any[]
  locale: string
  onSelectResult: (category: string, productIdentifier: string) => void
  bodyFont?: string
}

function SearchResultsDropdown({
  showDropdown,
  searchTerm,
  isLoading,
  results,
  locale,
  onSelectResult,
  bodyFont,
}: SearchResultsDropdownProps) {
  if (!showDropdown || searchTerm.trim().length < 1) return null

  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(locale)
  const fontFamily = bodyFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')

  // 🎯 FIX: Parse stringified JSON dictionaries before evaluating
  const getLocalizedText = (val: any): string => {
    if (!val) return ''

    let parsedVal = val

    // If it's a stringified JSON object, parse it into an actual object first
    if (typeof val === 'string' && val.trim().startsWith('{')) {
      try {
        parsedVal = JSON.parse(val)
      } catch {
        // Leave as string if parsing fails
      }
    }

    // Direct plain string (non-JSON)
    if (typeof parsedVal === 'string') {
      return parsedVal.trim()
    }

    // Localized dictionary object { en: "...", ckb: "..." }
    if (typeof parsedVal === 'object' && parsedVal !== null) {
      const match =
        parsedVal[locale] ||
        parsedVal.ckb ||
        parsedVal.en ||
        parsedVal.ar ||
        Object.values(parsedVal).find((v) => typeof v === 'string' && v.trim() !== '')

      if (match && typeof match === 'string') return match.trim()
    }

    return String(val || '')
  }

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
        <div className={styles.searchStatusItem} style={{ fontFamily }}>
          Loading...
        </div>
      ) : results.length > 0 ? (
        <ul className={styles.resultsList}>
          {results.map((item, idx) => {
            const displayTitle = getLocalizedText(item.title || item.name)

            const rawPrice =
              typeof item.price === 'object' ? getLocalizedText(item.price) : item.price

            const displayPrice =
              rawPrice !== null && rawPrice !== undefined && rawPrice !== ''
                ? String(rawPrice).startsWith('$')
                  ? rawPrice
                  : `$${rawPrice}`
                : null

            const imageUrl = getImageUrl(item)
            const category = item.categorySlug || 'product'
            const productIdentifier = item.slug || item.id

            return (
              <li
                key={item.id || idx}
                className={styles.resultsItem}
                onClick={() => onSelectResult(category, productIdentifier)}
              >
                <div className={styles.resultsLeftCol}>
                  <span className={styles.resultTitle} style={{ fontFamily }}>
                    {displayTitle}
                  </span>
                </div>
                <div className={styles.resultsRightCol}>
                  {displayPrice && (
                    <span className={styles.resultPrice} style={{ fontFamily }}>
                      {displayPrice}
                    </span>
                  )}
                  {imageUrl && (
                    <div className={styles.thumbWrapper}>
                      <Image
                        width={200}
                        height={200}
                        src={imageUrl}
                        alt={displayTitle}
                        className={styles.resultThumb}
                      />
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className={styles.searchStatusItem} style={{ fontFamily }}>
          No results found
        </div>
      )}
    </div>
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

  const isRegionalLocale = ['ar', 'ku', 'ckb'].includes(locale)
  const fontFamily = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'

  // Handles state reset directly on user interaction
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.trim().length < 1) {
      setResults([])
      setShowDropdown(false)
      setIsLoading(false)
    }
  }

  // Effect only fires asynchronous operations
  useEffect(() => {
    const trimmed = searchTerm.trim()
    if (trimmed.length < 1) return

    const cacheKey = `${trimmed.toLowerCase()}_${locale}`

    if (searchCache[cacheKey]) {
      const cached = searchCache[cacheKey]
      const timer = setTimeout(() => {
        setResults(cached)
        setShowDropdown(true)
        setIsLoading(false)
      }, 0)
      return () => clearTimeout(timer)
    }

    const delayDebounceFn = setTimeout(() => {
      setIsLoading(true)
      fetchSearchResults(trimmed, locale).then((data) => {
        setResults(data)
        setShowDropdown(true)
        setIsLoading(false)
      })
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
      const timer = setTimeout(() => mobileInputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isMobileOpen])

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    router.push(`/${locale}/search?q=${encodeURIComponent(searchTerm.trim())}`)
    setIsMobileOpen(false)
    setShowDropdown(false)
  }

  const handleSelectResult = (category: string, productIdentifier: string) => {
    router.push(`/${locale}/${category}/${productIdentifier}`)
    setShowDropdown(false)
    setIsMobileOpen(false)
  }

  const placeholders: Record<string, string> = {
    en: 'Search for CPUs, GPUs, laptops...',
    ar: 'ابحث عن معالجات، كروت شاشة، لابتوبات...',
    ckb: 'گەڕان بۆ پرۆسێسەر، کارتی شاشە، لاپتۆپ...',
  }

  return (
    <div className={styles.searchComponentRoot} ref={containerRef}>
      {/* 📱 Mobile Toggle Icon Button */}
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
          onChange={handleInputChange}
          placeholder={placeholders[locale] || placeholders.en}
          className={styles.desktopInput}
          style={{ fontFamily }}
          onFocus={() => setShowDropdown(searchTerm.trim().length >= 1)}
        />
        <button
          type="submit"
          className={styles.desktopSubmitBtn}
          style={{ [isRtl ? 'left' : 'right']: '12px' }}
        >
          <SearchIcon color="#808080" size={16} />
        </button>

        <SearchResultsDropdown
          showDropdown={showDropdown}
          searchTerm={searchTerm}
          isLoading={isLoading}
          results={results}
          locale={locale}
          onSelectResult={handleSelectResult}
          bodyFont={fontFamily}
        />
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
              onChange={handleInputChange}
              placeholder={placeholders[locale] || placeholders.en}
              className={styles.mobileInput}
              style={{ fontFamily }}
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

        <SearchResultsDropdown
          showDropdown={showDropdown}
          searchTerm={searchTerm}
          isLoading={isLoading}
          results={results}
          locale={locale}
          onSelectResult={handleSelectResult}
          bodyFont={fontFamily}
        />
      </div>
    </div>
  )
}
