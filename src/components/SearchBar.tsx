'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, FormEvent, useEffect, useRef } from 'react'

interface SearchBarProps {
  locale: string
}

export default function SearchBar({ locale }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  // State to manage expanding overlay drawer on mobile viewports
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    // Push users directly to the clean routing page
    router.push(`/${locale}/search?q=${encodeURIComponent(searchTerm.trim())}`)
    setIsMobileOpen(false) // Close the drawer on search execution
  }

  // Focus input automatically when mobile user toggles search button open
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

  const isRtl = locale === 'ar' || locale === 'ckb'

  return (
    <>
      {/* 1. Global CSS Injector to manage seamless responsive viewport switches cleanly without bulky tailwind setups */}
      <style>{`
        .search-form-desktop {
          display: flex;
          width: 100%;
          max-width: 400px;
          position: relative;
        }
        .search-mobile-toggle-btn {
          display: none;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
        }
        .search-mobile-overlay {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          width: 100%;
          background: #fff;
          padding: 10px 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          z-index: 99;
          border-bottom: 1px solid #eee;
        }

        /* Responsive Breakpoint Matrix rules */
        @media (max-width: 768px) {
          .search-form-desktop {
            display: none !important;
          }
          .search-mobile-toggle-btn {
            display: block !important;
          }
          .search-mobile-overlay.is-active {
            display: block !important;
          }
        }
      `}</style>

      {/* === MOBILE TRIGGER BUTTON === */}
      <button
        type="button"
        className="search-mobile-toggle-btn"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle search input panel"
      >
        {isMobileOpen ? '✕' : '🔍'}
      </button>

      {/* === MOBILE ACCORDION OVERLAY === */}
      <div className={`search-mobile-overlay ${isMobileOpen ? 'is-active' : ''}`}>
        <form
          onSubmit={handleSearch}
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
              border: '1px solid #0070f3',
              outline: 'none',
              backgroundColor: '#fff',
              paddingRight: !isRtl ? '45px' : '16px',
              paddingLeft: isRtl ? '45px' : '16px',
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: !isRtl ? '12px' : 'auto',
              left: isRtl ? '12px' : 'auto',
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
      </div>

      {/* === DESKTOP STATIC FORM INLINE === */}
      <form
        onSubmit={handleSearch}
        className="search-form-desktop"
        style={{ direction: isRtl ? 'rtl' : 'ltr' }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholders[locale] || placeholders.en}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            fontSize: '14px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            outline: 'none',
            backgroundColor: '#f9f9f9',
            transition: 'border-color 0.15s ease',
            paddingRight: !isRtl ? '40px' : '16px',
            paddingLeft: isRtl ? '40px' : '16px',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#0070f3')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
        />
        <button
          type="submit"
          style={{
            position: 'absolute',
            right: !isRtl ? '12px' : 'auto',
            left: isRtl ? '12px' : 'auto',
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
      </form>
    </>
  )
}
