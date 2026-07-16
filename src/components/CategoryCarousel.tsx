'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MAIN_CATEGORY_GROUPS } from '@/utils/categories'
import styles from '@/styles/category_carousel.module.css'

interface CategoryDropdownNavProps {
  currentLocale: string
}

export default function CategoryDropdownNav({ currentLocale }: CategoryDropdownNavProps) {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isHamOpen, setIsHamOpen] = useState<boolean>(false)
  const navRef = useRef<HTMLDivElement>(null)

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const activeLocale = (
    MAIN_CATEGORY_GROUPS[currentLocale as 'en' | 'ar' | 'ckb'] ? currentLocale : 'en'
  ) as 'en' | 'ar' | 'ckb'

  const categories = useMemo(() => {
    return MAIN_CATEGORY_GROUPS[activeLocale] || []
  }, [activeLocale])

  const titleFont = isRtl ? '"Rudaw", sans-serif' : 'system-ui, sans-serif'

  // Translation helpers
  const caseOffersTitle = useMemo(() => {
    if (activeLocale === 'ckb') return 'ئۆفەری کەیس'
    if (activeLocale === 'ar') return 'عروض الكيسات الكاملة'
    return 'Full Build Offers'
  }, [activeLocale])

  // Close open dropdowns if user clicks outside of the navigation wrapper
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

  const handleToggleDropdown = (index: number) => {
    setActiveDropdown((prev) => (prev === index ? null : index))
  }

  return (
    <div
      className={styles['nav-wrapper']}
      style={{ direction: isRtl ? 'rtl' : 'ltr', fontFamily: titleFont }}
      ref={navRef}
    >
      <div className={styles['nav-container']}>
        {/* Hamburger Menu Button (Positioned left across all locales) */}
        <button
          type="button"
          className={styles['ham-menu-btn']}
          onClick={() => setIsHamOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        {/* Desktop Navigation Items Wrapper */}
        <div className={styles['desktop-nav-items']}>
          {/* Full Build Offers (Always direct Link on the edge) */}
          <div className={styles['nav-item-wrapper']}>
            <Link href={`/${activeLocale}/case-offers`} className={styles['direct-link-btn']}>
              {caseOffersTitle}
            </Link>
          </div>

          {/* Dynamic Category List */}
          {categories.map((category, index) => {
            const isIndependent = !!category.slug

            if (isIndependent) {
              return (
                <div key={index} className={styles['nav-item-wrapper']}>
                  <Link
                    href={`/${activeLocale}?category=${category.slug}`}
                    className={styles['direct-link-btn']}
                  >
                    {category.title}
                  </Link>
                </div>
              )
            }

            const isOpen = activeDropdown === index

            return (
              <div key={index} className={styles['nav-item-wrapper']}>
                <button
                  type="button"
                  onClick={() => handleToggleDropdown(index)}
                  className={`${styles['dropdown-trigger-btn']} ${isOpen ? styles['active-trigger'] : ''}`}
                >
                  {category.title}
                  <span className={styles['dropdown-caret']}>▼</span>
                </button>

                {/* Nested Dropdown List */}
                {isOpen && category.subCategories && (
                  <div className={styles['dropdown-menu']}>
                    {category.subCategories.map((sub, subIdx) => (
                      <Link
                        key={subIdx}
                        href={`/${activeLocale}?category=${sub.slug}`}
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

      {/* Mobile Dropdown Menu Drawer */}
      {isHamOpen && (
        <div className={styles['mobile-dropdown-panel']}>
          {/* Full Build Offers link */}
          <Link
            href={`/${activeLocale}/case-offers`}
            className={styles['mobile-item-link']}
            onClick={() => setIsHamOpen(false)}
          >
            {caseOffersTitle}
          </Link>

          {/* Dynamic Categories inside Hamburger Drawer */}
          {categories.map((category, index) => {
            if (category.slug) {
              return (
                <Link
                  key={index}
                  href={`/${activeLocale}?category=${category.slug}`}
                  className={styles['mobile-item-link']}
                  onClick={() => setIsHamOpen(false)}
                >
                  {category.title}
                </Link>
              )
            }

            return (
              <div key={index} className={styles['mobile-group-section']}>
                <div className={styles['mobile-group-title']}>{category.title}</div>
                {category.subCategories?.map((sub, subIdx) => (
                  <Link
                    key={subIdx}
                    href={`/${activeLocale}?category=${sub.slug}`}
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
  )
}
