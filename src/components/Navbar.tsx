'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getNavbarStyles } from '@/styles/navbar_styles'
import styles from '@/styles/navbar.module.css'
import Languages from './Languages'

interface CategoryItem {
  id: string | number
  title: string
  slug: string
}

interface NavbarProps {
  currentLocale?: string
  activeCategory?: string | null
  categories?: CategoryItem[]
}

export default function Navbar({
  currentLocale: initialLocale,
  activeCategory,
  categories = [],
}: NavbarProps) {
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

      <div
        className={styles.navContainer}
        style={
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem', // 🟢 Added global horizontal safety padding so items don't hit edge of screen
            '--nav-links-display': isOpen ? 'flex' : 'none',
            '--nav-links-left': isRtl ? 'auto' : '0',
            '--nav-links-right': isRtl ? '0' : 'auto',
            '--dropdown-trigger-align': isRtl ? 'right' : 'left',
            '--dropdown-content-pl': isRtl ? '0' : '1rem',
            '--dropdown-content-pr': isRtl ? '1rem' : '0',
          } as React.CSSProperties
        }
      >
        {/* 1. Languages Dropdown */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginInlineEnd: isRtl ? '0' : '0.5rem', // 🟢 Subtle safe margins between elements
            marginInlineStart: isRtl ? '0.5rem' : '0',
          }}
        >
          <Languages currentLocale={currentLocale} />
        </div>

        {/* 2. Hamburger Toggle */}
        <label
          className={styles.burgerMenu}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            order: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            margin: '0 0.5rem', // 🟢 Side margins for spacing
          }}
        >
          ☰
        </label>

        {/* 3. Dynamic DB Category Listing Mapping */}
        <div
          className={styles.navLinks}
          style={{
            order: 3,
            display: isOpen ? 'flex' : 'none', // Overrides/complements your CSS module rules cleanly
            alignItems: 'center',
            backgroundColor: isOpen ? '#ffffff' : 'transparent', // 🟢 Forces open state mobile container to have a clean white bg
          }}
        >
          <div className={styles.navDropdown}>
            <button className={styles.dropdownTrigger}>
              {currentLocale === 'ar'
                ? 'الأقسام'
                : currentLocale === 'ckb'
                  ? 'هاوپۆلەکان'
                  : 'Categories'}{' '}
              ▾
            </button>
            <div className={styles.dropdownContent}>
              {categories.map((category) => {
                const isActive = activeCategory === category.slug

                return (
                  <Link
                    key={category.id || category.slug}
                    href={`/${currentLocale}?category=${category.slug}`}
                    onClick={() => setIsOpen(false)}
                    style={{
                      color: isActive ? '#0070f3' : '#555',
                      fontWeight: isActive ? '700' : undefined,
                      textDecoration: 'none',
                      fontSize: '14px',
                      padding: '4px 0',
                    }}
                  >
                    {category.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* 4. Shopping Cart Icon Section */}
        <div
          className={styles.cartWrapper}
          style={{
            order: isRtl ? 1 : 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginInlineStart: isRtl ? '0' : '0.5rem',
            marginInlineEnd: isRtl ? '0.5rem' : '0',
          }}
        >
          <Link
            href={`/${currentLocale}/cart`}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              color: '#808080',
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
      </div>
    </>
  )
}
