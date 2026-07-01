'use client'

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

  const segments = pathname.split('/')
  const currentLocale = ['en', 'ar', 'ckb'].includes(segments[1])
    ? segments[1]
    : initialLocale || 'en'

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: getNavbarStyles(isRtl) }} />

      <div className="nav-container">
        <input type="checkbox" id="menu-toggle" />
        <label htmlFor="menu-toggle" className="burger-menu">
          ☰
        </label>

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
                        style={{
                          color: isActive ? '#0070f3' : undefined,
                          fontWeight: isActive ? '700' : undefined,
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

        <div className="pc-builder-wrapper">
          <Link
            href={`/${currentLocale}/pc-builder`}
            className="pc-builder-btn"
            style={{
              background: '#df8026',
              color: '#fff',
              padding: '0.2rem 1rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block',
              whiteSpace: 'nowrap',
            }}
          >
            {currentLocale === 'ar'
              ? 'تجميع جهازك'
              : currentLocale === 'ckb'
                ? 'کۆمپیوتەرەکەت ببەستە'
                : 'PC Builder'}
          </Link>
        </div>
      </div>
    </>
  )
}
