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

  // 🎯 Safe Locale Parsing from current viewport URL path
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
    <div className="search-component-root" style={{ position: 'relative' }}>
      <style>{`
        .search-form-desktop { display: flex; width: 100%; max-width: 400px; position: relative; }
        .search-mobile-toggle-btn { display: none; background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; color: #94a3b8; }
        .search-mobile-overlay { display: none; position: absolute; top: calc(100% + 12px); left: 0; right: 0; width: 100%; background: #1e293b; padding: 10px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 99; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); }
        @media (max-width: 768px) {
          .search-form-desktop { display: none !important; }
          .search-mobile-toggle-btn { display: block !important; }
          .search-mobile-overlay.is-active { display: block !important; }
        }
      `}</style>

      <button
        type="button"
        className="search-mobile-toggle-btn"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? '✕' : '🔍'}
      </button>

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
              backgroundColor: '#fff',
              color: '#000',
              paddingInlineEnd: '45px',
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              [isRtl ? 'left' : 'right']: '12px',
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

      <form onSubmit={handleSearch} className="search-form-desktop">
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
            border: '1px solid rgba(255, 255, 255, 0.2)',
            outline: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            transition: 'border-color 0.15s ease',
            paddingInlineEnd: '40px',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
        />
        <button
          type="submit"
          style={{
            position: 'absolute',
            [isRtl ? 'left' : 'right']: '12px',
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
