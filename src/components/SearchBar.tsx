'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, FormEvent, useEffect, useRef } from 'react'

export default function SearchBar({ locale: initialLocale }: { locale: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const segments = pathname.split('/')
  const locale = ['en', 'ar', 'ckb'].includes(segments[1]) ? segments[1] : initialLocale || 'en'
  const isRtl = locale === 'ar' || locale === 'ckb'

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    router.push(`/${locale}/search?q=${encodeURIComponent(searchTerm.trim())}`)
    setIsMobileOpen(false)
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

  return (
    <div className="search-component-root">
      <style>{`
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
          /* Stretching left and right to 0 anchors the width perfectly in both LTR & RTL */
          left: 0; 
          right: 0; 
          background: #ffffff; 
          padding: 0.75rem 1rem; 
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); 
          z-index: 9999; 
          border-bottom: 1px solid #e2e8f0;
          box-sizing: border-box;
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
      </div>

      {/* DESKTOP SEARCH BAR */}
      <form onSubmit={handleSearch} className="search-form-desktop">
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
      </form>
    </div>
  )
}
