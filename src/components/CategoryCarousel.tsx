'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '@/styles/category_carousel.module.css'
import { CategoryDropdownNavProps } from '@/types/types'

// Payload GeneralSettings interface based on your schema
export interface GeneralSettingsProps {
  navbar?: {
    width?: 'full' | 'fit-content'
    backgroundColor?: string
    textColor?: string
  }
}

interface ComponentProps extends CategoryDropdownNavProps {
  generalSettings?: GeneralSettingsProps
}

export default function CategoryDropdownNav({
  currentLocale,
  categories = [],
  generalSettings,
}: ComponentProps) {
  const router = useRouter()
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isHamOpen, setIsHamOpen] = useState<boolean>(false)
  const navRef = useRef<HTMLDivElement>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hamTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const titleFont = isRtl ? '"Rudaw", sans-serif' : 'system-ui, sans-serif'

  // Extract Payload CMS values with fallbacks
  const navbarConfig = generalSettings?.navbar
  const navBg = navbarConfig?.backgroundColor || '#ffb83c'
  const navText = navbarConfig?.textColor || '#000000'
  const isFitContent = navbarConfig?.width === 'fit-content'

  useEffect(() => {
    const isMobile = window.innerWidth <= 900

    if (isHamOpen && isMobile) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isHamOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
        setIsHamOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(index)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  const handleHamMouseEnter = () => {
    if (hamTimeoutRef.current) clearTimeout(hamTimeoutRef.current)
    setIsHamOpen(true)
  }

  const handleHamMouseLeave = () => {
    hamTimeoutRef.current = setTimeout(() => {
      setIsHamOpen(false)
    }, 150)
  }

  const handleToggleDropdown = (index: number) => {
    setActiveDropdown((prev) => (prev === index ? null : index))
  }

  return (
    <div
      className={`${styles['nav-wrapper']} ${
        isFitContent ? styles['fit-content'] : styles['full-width']
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={
        {
          direction: isRtl ? 'rtl' : 'ltr',
          fontFamily: titleFont,
          '--navbar-bg': navBg,
          '--navbar-text': navText,
        } as React.CSSProperties
      }
      ref={navRef}
    >
      <div className={styles['nav-container']}>
        {/* Hamburger Menu Wrapper */}
        <div
          className={styles['ham-wrapper']}
          onMouseEnter={handleHamMouseEnter}
          onMouseLeave={handleHamMouseLeave}
        >
          <button
            type="button"
            className={styles['ham-menu-btn']}
            onClick={() => setIsHamOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>

          {/* Floating Dropdown Panel */}
          {isHamOpen && (
            <div className={styles['mobile-dropdown-panel']}>
              {categories.map((category, index) => {
                if (!category.isContainer && category.slug) {
                  return (
                    <Link
                      key={category.id || index}
                      href={`/${currentLocale}?category=${category.slug}`}
                      className={styles['mobile-item-link']}
                      onClick={() => setIsHamOpen(false)}
                    >
                      {category.title}
                    </Link>
                  )
                }

                return (
                  <div key={category.id || index} className={styles['mobile-group-section']}>
                    <div className={styles['mobile-group-title']}>{category.title}</div>
                    {category.subCategories?.map((sub, subIdx) => (
                      <Link
                        key={subIdx}
                        href={`/${currentLocale}?category=${sub.slug}`}
                        className={styles['mobile-sub-link']}
                        onClick={() => setIsHamOpen(false)}
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Desktop Navigation Items Wrapper */}
        <div className={styles['desktop-nav-items']}>
          {categories.map((category, index) => {
            const isIndependent = !category.isContainer && !!category.slug

            if (isIndependent) {
              return (
                <div key={category.id || index} className={styles['nav-item-wrapper']}>
                  <button
                    type="button"
                    onClick={() => router.push(`/${currentLocale}?category=${category.slug}`)}
                    className={styles['direct-link-btn']}
                  >
                    {category.title}
                  </button>
                </div>
              )
            }

            const isOpen = activeDropdown === index

            return (
              <div
                key={category.id || index}
                className={styles['nav-item-wrapper']}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => handleToggleDropdown(index)}
                  className={`${styles['dropdown-trigger-btn']} ${
                    isOpen ? styles['active-trigger'] : ''
                  }`}
                >
                  {category.title}
                  <span className={styles['dropdown-caret']}>▼</span>
                </button>

                {isOpen && category.subCategories && (
                  <div className={styles['dropdown-menu']}>
                    {category.subCategories.map((sub, subIdx) => (
                      <Link
                        key={subIdx}
                        href={`/${currentLocale}?category=${sub.slug}`}
                        className={styles['dropdown-item-link']}
                        onClick={() => setActiveDropdown(null)}
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
