'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '@/styles/category_carousel.module.css'

export interface CategoryItem {
  id?: string
  title: string
  slug?: string
  isContainer?: boolean
  subCategories?: Array<{
    title: string
    slug: string
  }>
}

interface CategoryDropdownNavProps {
  currentLocale: string
  categories: CategoryItem[]
}

export default function CategoryDropdownNav({
  currentLocale,
  categories = [],
}: CategoryDropdownNavProps) {
  const router = useRouter()
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isHamOpen, setIsHamOpen] = useState<boolean>(false)
  const navRef = useRef<HTMLDivElement>(null)

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const titleFont = isRtl ? '"Rudaw", sans-serif' : 'system-ui, sans-serif'

  // Lock body scroll on mobile when hamburger drawer is open
  useEffect(() => {
    if (isHamOpen) {
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
              <div key={category.id || index} className={styles['nav-item-wrapper']}>
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
