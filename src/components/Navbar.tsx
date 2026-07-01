import Link from 'next/link'
import { navTree } from '@/utils/nav_tree'
import { getNavbarStyles } from '@/styles/navbar_styles'

interface NavbarProps {
  currentLocale: string
  activeCategory?: string
}

export default function Navbar({ currentLocale, activeCategory }: NavbarProps) {
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  return (
    <>
      <style>{getNavbarStyles(isRtl)}</style>

      <div className="nav-container">
        <input type="checkbox" id="menu-toggle" />
        <label htmlFor="menu-toggle" className="burger-menu">
          ☰
        </label>

        {/* Group 1: The standard categories layout loop */}
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

        {/* 🌟 FIX: Moved outside .nav-links wrapper into the parent flex container */}
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
