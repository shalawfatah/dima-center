'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '@/styles/category_carousel.module.css'
import { CategoryDropdownNavProps } from '@/types/types'

export default function CategoryDropdownNav({
  currentLocale,
  categories = [],
}: CategoryDropdownNavProps) {
  const router = useRouter()
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isHamOpen, setIsHamOpen] = useState<boolean>(false)
  const navRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const titleFont = isRtl ? '"Rudaw", sans-serif' : 'system-ui, sans-serif'

  // Lock body scroll ONLY on mobile screen sizes when drawer is open
  useEffect(() => {
    const isMobile = window.innerWidth <= 900

    if (isHamOpen && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isHamOpen])

  // Close open dropdowns if user clicks outside
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

  // Mouse handlers for desktop hover with delay buffer
  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(index)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150) // 150ms buffer prevents accidental closure when moving mouse to menu
  }

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
        {/* Hamburger Menu Button */}
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

      {/* Mobile Drawer */}
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
  )
}
