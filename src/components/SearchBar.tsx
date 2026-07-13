'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, FormEvent, useEffect, useRef } from 'react'

// ⚡ REAL DATABASE FETCH FUNCTION (Hits your custom Payload CMS API Route)
async function fetchSearchResults(query: string, locale: string) {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&locale=${locale}`)
    if (!res.ok) throw new Error('Search network request failed')

    const data = await res.json()
    // Payload returns result.docs from the backend; the API endpoint maps this to an array
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Error fetching real-time search results:', err)
    return []
  }
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

  // 1. Debounce and fetch logic
  useEffect(() => {
    const trimmed = searchTerm.trim()

    if (trimmed.length < 3) {
      setResults([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)

    // Wait 500ms after user stops typing to trigger the request
    const delayDebounceFn = setTimeout(async () => {
      const data = await fetchSearchResults(trimmed, locale)
      setResults(data)
      setShowDropdown(true)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, locale])

  // 2. Close dropdown if clicked outside of component container
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

  // Common Results Dropdown UI component to keep it DRY
  const RenderSearchResults = () => {
    if (!showDropdown || searchTerm.trim().length < 3) return null

    return (
      <div className="search-results-dropdown" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
        {isLoading ? (
          <div className="search-status-item">Loading...</div>
        ) : results.length > 0 ? (
          <ul className="results-list">
            {results.map((item) => {
              // Gracefully handle both "title" (standard Payload) or "name" fields
              const displayName = item.title || item.name || ''
              return (
                <li
                  key={item.id}
                  onClick={() => {
                    setSearchTerm(displayName)
                    triggerSearchRedirect(displayName)
                  }}
                  className="results-item"
                >
                  🔍 {displayName}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="search-status-item">No results found</div>
        )}
      </div>
    )
  }

  return (
    <div className="search-component-root" ref={containerRef}>
      <style>{`
        .search-component-root {
          position: relative;
        }
        .search-form-desktop { 
          display: flex; 
          width: 550px;
          max-width: 100%;
          position: relative; 
        }
        .search-mobile-toggle-btn { 
          display: none; 
          background: none; 
          border: none; 
          font-size: 22px; 
          cursor: pointer; 
          padding: 6px; 
          color: #475569; 
        }
        
        /* 🎯 MULTI-LANGUAGE STABLE LAYOUT */
        .search-mobile-overlay { 
          display: none; 
          position: absolute; 
          top: 100%; 
          left: 0; 
          right: 0; 
          background: #ffffff; 
          padding: 0.75rem 1rem; 
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); 
          z-index: 9999; 
          border-bottom: 1px solid #e2e8f0;
          box-sizing: border-box;
        }

        /* 📋 REAL-TIME DROPDOWN STYLING */
        .search-results-dropdown {
          position: absolute;
          top: 105%;
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 10000;
          overflow: hidden;
          font-size: 14px;
        }
        .results-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .results-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          color: #1e293b;
          transition: background-color 0.15s ease;
          border-bottom: 1px solid #f1f5f9;
          text-align: start;
        }
        .results-item:last-child {
          border-bottom: none;
        }
        .results-item:hover {
          background-color: #f1f5f9;
        }
        .search-status-item {
          padding: 1rem;
          color: #64748b;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .search-form-desktop { display: none !important; }
          .search-mobile-toggle-btn { display: block !important; }
          .search-mobile-overlay.is-active { 
            display: block !important; 
          }
        }
      `}</style>

      <button
        type="button"
        className="search-mobile-toggle-btn"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? '✕' : '🔍'}
      </button>

      {/* MOBILE OVERLAY DROPDOWN */}
      <div className={`search-mobile-overlay ${isMobileOpen ? 'is-active' : ''}`}>
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
            🔍
          </button>
        </form>
        {/* Render Mobile Results inside the active overlay container */}
        <RenderSearchResults />
      </div>

      {/* DESKTOP SEARCH BAR */}
      <form onSubmit={handleSearchSubmit} className="search-form-desktop">
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
            setShowDropdown(searchTerm.trim().length >= 3)
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
          🔍
        </button>
        {/* Render Desktop Results */}
        <RenderSearchResults />
      </form>
    </div>
  )
}
