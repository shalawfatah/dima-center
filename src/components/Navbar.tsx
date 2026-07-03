'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navTree } from '@/utils/nav_tree'
import { getNavbarStyles } from '@/styles/navbar_styles'

interface NavbarProps {
  currentLocale?: string
  activeCategory?: string | null
}

export default function Navbar({ currentLocale: initialLocale, activeCategory }: NavbarProps) {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState<number>(0)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const segments = pathname.split('/')
  const currentLocale = ['en', 'ar', 'ckb'].includes(segments[1])
    ? segments[1]
    : initialLocale || 'en'

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  useEffect(() => {
    const updateCount = () => {
      try {
        const storedCart = localStorage.getItem('cart')
        if (storedCart) {
          const parsed = JSON.parse(storedCart)
          if (Array.isArray(parsed)) {
            const total = parsed.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)
            setCartCount(total)
            return
          }
        }
        setCartCount(0)
      } catch (err) {
        console.error('Error parsing cart data:', err)
        setCartCount(0)
      }
    }

    updateCount()
    window.addEventListener('cart-updated', updateCount)
    window.addEventListener('storage', updateCount)

    return () => {
      window.removeEventListener('cart-updated', updateCount)
      window.removeEventListener('storage', updateCount)
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getNavbarStyles(isRtl) }} />

      <style>{`
        .nav-container {
          display: flex !important;
          align-items: center !important;
          position: relative;
          padding: 0.50rem 1rem;
          width: 100%;
        }
        .burger-menu {
          display: block !important;
          font-size: 1.75rem;
          cursor: pointer;
          order: 1 !important; 
        }
        .cart-wrapper {
          order: 2 !important;
        }
        .nav-links {
          display: ${isOpen ? 'flex !important' : 'none !important'};
          flex-direction: column !important;
          position: absolute !important;
          top: 100% !important;
          left: 0 !important;
          background: #fff !important;
          width: 260px !important;
          border: 1px solid #eaeaea !important;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
          padding: 1rem !important;
          z-index: 1000 !important;
          gap: 0.75rem !important;
        }
        .nav-dropdown {
          width: 100%;
        }
        .dropdown-trigger {
          width: 100%;
          text-align: ${isRtl ? 'right' : 'left'} !important;
          padding: 0.5rem 0;
          background: none;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
        }
        .dropdown-content {
          position: static !important;
          display: flex !important;
          flex-direction: column !important;
          box-shadow: none !important;
          padding-left: ${isRtl ? '0' : '1rem'} !important;
          padding-right: ${isRtl ? '1rem' : '0'} !important;
          gap: 0.5rem;
          border: none !important;
        }
      `}</style>

      <div className="nav-container">
        {/* Hamburger Toggle */}
        <label className="burger-menu" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </label>

        {/* Shopping Cart Icon Section */}
        <div className="cart-wrapper">
          <Link
            href={`/${currentLocale}/cart`}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              color: '#333',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            aria-label="Shopping Cart"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>

            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: isRtl ? 'auto' : '-2px',
                  left: isRtl ? '-2px' : 'auto',
                  background: '#ff3b30',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '700',
                  borderRadius: '50%',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Dropdown Items Navigation Menu Links */}
        <div className="nav-links">
          {navTree.map((group, index) => {
            const parentLabel =
              currentLocale === 'ar'
                ? group.parent.ar
                : currentLocale === 'ckb'
                  ? group.parent.ckb
                  : group.parent.en

            return (
              <div key={index} className="nav-dropdown">
                <button className="dropdown-trigger">{parentLabel} ▾</button>
                <div className="dropdown-content">
                  {group.children.map((child) => {
                    const childLabel =
                      currentLocale === 'ar'
                        ? child.ar
                        : currentLocale === 'ckb'
                          ? child.ckb
                          : child.en

                    const isActive = activeCategory === child.slug

                    return (
                      <Link
                        key={child.slug}
                        href={`/${currentLocale}?category=${child.slug}`}
                        onClick={() => setIsOpen(false)}
                        style={{
                          color: isActive ? '#0070f3' : '#555',
                          fontWeight: isActive ? '700' : undefined,
                          textDecoration: 'none',
                          fontSize: '14px',
                        }}
                      >
                        {childLabel}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
