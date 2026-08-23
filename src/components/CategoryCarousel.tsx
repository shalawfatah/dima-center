'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '@/styles/category_carousel.module.css'
import { CategoryDropdownNavProps } from '@/types/types'

export interface FontMedia {
  id?: number | string
  url?: string
  filename?: string
  alt?: string
  [key: string]: any
}

export interface LanguageTypography {
  headingFont?: FontMedia | string | null
  bodyFont?: FontMedia | string | null
}

interface ComponentProps extends CategoryDropdownNavProps {
  generalSettings?: any
}

export default function CategoryDropdownNav({
  currentLocale,
  categories = [],
  generalSettings,
}: ComponentProps) {
  const router = useRouter()
  const [activeDropdown, setActiveDropdown] = useState<number | string | null>(null)
  const [isHamOpen, setIsHamOpen] = useState<boolean>(false)
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<
    Record<string | number, boolean>
  >({})

  // Track visible categories count for dynamic desktop overflow
  const [visibleCount, setVisibleCount] = useState<number>(categories.length)

  const navRef = useRef<HTMLDivElement>(null)
  const desktopNavRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hamTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  // Locale-aware translation for the "More" dropdown button
  const getMoreLabel = () => {
    if (currentLocale === 'ckb') return 'ئەوانیتر'
    if (currentLocale === 'ar') return 'المزيد'
    return 'More'
  }

  const handleCloseHam = () => setIsHamOpen(false)
  const handleToggleHam = () => setIsHamOpen((prev) => !prev)

  const typographyConfig = generalSettings?.typography
  let selectedHeadingFont: FontMedia | string | null | undefined

  if (currentLocale === 'ckb') {
    selectedHeadingFont = typographyConfig?.kurdish?.headingFont
  } else if (currentLocale === 'ar') {
    selectedHeadingFont = typographyConfig?.arabic?.headingFont
  } else {
    selectedHeadingFont = typographyConfig?.english?.headingFont
  }

  let customFontFamily = isRtl ? '"Rudaw", sans-serif' : 'system-ui, sans-serif'
  let dynamicFontFaceRule = ''

  if (
    selectedHeadingFont &&
    typeof selectedHeadingFont === 'object' &&
    'url' in selectedHeadingFont &&
    selectedHeadingFont.url
  ) {
    const fontName = `PayloadFont_${currentLocale}_Heading`
    customFontFamily = `"${fontName}", "Rudaw", sans-serif`

    dynamicFontFaceRule = `
      @font-face {
        font-family: '${fontName}';
        src: url('${selectedHeadingFont.url}') format('truetype');
        font-display: swap;
      }
    `
  } else if (typeof selectedHeadingFont === 'string' && selectedHeadingFont.trim() !== '') {
    customFontFamily = `"${selectedHeadingFont}", "Rudaw", sans-serif`
  }

  const titleFont = customFontFamily
  const navbarConfig = generalSettings?.navbar
  const navBg = navbarConfig?.backgroundColor || '#ffb83c'
  const navText = navbarConfig?.textColor || '#000000'
  const isFitContent = navbarConfig?.width === 'fit-content'

  // Dynamic calculation for Desktop "More" dropdown
  const calculateVisibleItems = () => {
    if (!desktopNavRef.current) return
    const container = desktopNavRef.current
    const containerWidth = container.clientWidth
    const children = Array.from(container.children) as HTMLElement[]

    if (children.length === 0) return

    const MORE_BTN_WIDTH = 90
    let currentWidth = 0
    let fitCount = 0

    for (let i = 0; i < categories.length; i++) {
      const child = children[i]
      if (!child) break

      const itemWidth = child.offsetWidth
      if (currentWidth + itemWidth > containerWidth - MORE_BTN_WIDTH) {
        break
      }
      currentWidth += itemWidth
      fitCount++
    }

    setVisibleCount(Math.max(1, fitCount))
  }

  useLayoutEffect(() => {
    calculateVisibleItems()
  }, [categories])

  useEffect(() => {
    const container = desktopNavRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      calculateVisibleItems()
    })
    observer.observe(container)

    return () => observer.disconnect()
  }, [categories])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
        handleCloseHam()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseEnter = (key: number | string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(key)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  const handleHamMouseEnter = () => {
    if (hamTimeoutRef.current) clearTimeout(hamTimeoutRef.current)
    setIsHamOpen(true)
  }

  const handleHamMouseLeave = () => {
    hamTimeoutRef.current = setTimeout(() => handleCloseHam(), 150)
  }

  const handleToggleDropdown = (key: number | string) => {
    setActiveDropdown((prev) => (prev === key ? null : key))
  }

  const toggleMobileCategory = (catKey: string | number) => {
    setExpandedMobileCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }))
  }

  const visibleCategories = categories.slice(0, visibleCount)
  const overflowCategories = categories.slice(visibleCount)

  return (
    <>
      {dynamicFontFaceRule && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceRule }} />}

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
            '--navbar-font': titleFont,
          } as React.CSSProperties
        }
        ref={navRef}
      >
        <div className={styles['nav-container']}>
          {/* Hamburger Menu Wrapper (Left on LTR desktop, Right on RTL desktop, ALWAYS Right on mobile) */}
          <div
            className={styles['ham-wrapper']}
            onMouseEnter={handleHamMouseEnter}
            onMouseLeave={handleHamMouseLeave}
          >
            <button
              type="button"
              className={styles['ham-menu-btn']}
              onClick={handleToggleHam}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>

            <AnimatePresence>
              {isHamOpen && (
                <motion.div
                  className={styles['mobile-dropdown-panel']}
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {categories.map((category, index) => {
                    const catKey = category.id || index
                    const hasSub =
                      Array.isArray(category.subCategories) && category.subCategories.length > 0
                    const isExpanded = !!expandedMobileCategories[catKey]

                    if (!category.isContainer && category.slug && !hasSub) {
                      return (
                        <Link
                          key={catKey}
                          href={`/${currentLocale}?category=${category.slug}`}
                          className={styles['mobile-item-link']}
                          onClick={handleCloseHam}
                        >
                          {category.title}
                        </Link>
                      )
                    }

                    return (
                      <div key={catKey} className={styles['mobile-group-section']}>
                        <button
                          type="button"
                          className={styles['mobile-group-title-btn']}
                          onClick={() => toggleMobileCategory(catKey)}
                        >
                          <span>{category.title}</span>
                          {hasSub && (
                            <span
                              className={styles['mobile-caret']}
                              style={{
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              }}
                            >
                              ▼
                            </span>
                          )}
                        </button>

                        {hasSub && isExpanded && (
                          <div className={styles['mobile-sub-container']}>
                            {category.subCategories?.map((sub, subIdx) => (
                              <Link
                                key={subIdx}
                                href={`/${currentLocale}?category=${sub.slug}`}
                                className={styles['mobile-sub-link']}
                                onClick={handleCloseHam}
                              >
                                {sub.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Navigation Container */}
          <div className={styles['desktop-nav-items']} ref={desktopNavRef}>
            {visibleCategories.map((category, index) => {
              const catKey = category.id || index
              const isIndependent = !category.isContainer && !!category.slug

              if (isIndependent) {
                return (
                  <div key={catKey} className={styles['nav-item-wrapper']}>
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

              const isOpen = activeDropdown === catKey

              return (
                <div
                  key={catKey}
                  className={styles['nav-item-wrapper']}
                  onMouseEnter={() => handleMouseEnter(catKey)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleDropdown(catKey)}
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

            {/* Dynamic "More" Dropdown Trigger */}
            {overflowCategories.length > 0 && (
              <div
                className={styles['nav-item-wrapper']}
                onMouseEnter={() => handleMouseEnter('more_overflow')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => handleToggleDropdown('more_overflow')}
                  className={`${styles['dropdown-trigger-btn']} ${
                    activeDropdown === 'more_overflow' ? styles['active-trigger'] : ''
                  }`}
                >
                  {getMoreLabel()}
                  <span className={styles['dropdown-caret']}>▼</span>
                </button>

                {activeDropdown === 'more_overflow' && (
                  <div className={`${styles['dropdown-menu']} ${styles['dropdown-menu-end']}`}>
                    {overflowCategories.map((category, idx) => {
                      const hasSub =
                        Array.isArray(category.subCategories) && category.subCategories.length > 0

                      if (hasSub) {
                        return (
                          <div key={category.id || idx} className={styles['overflow-group']}>
                            <div className={styles['dropdown-group-title']}>{category.title}</div>
                            {category.subCategories?.map((sub, subIdx) => (
                              <Link
                                key={subIdx}
                                href={`/${currentLocale}?category=${sub.slug}`}
                                className={`${styles['dropdown-item-link']} ${styles['nested-link']}`}
                                onClick={() => setActiveDropdown(null)}
                              >
                                {sub.title}
                              </Link>
                            ))}
                          </div>
                        )
                      }

                      return (
                        <Link
                          key={category.id || idx}
                          href={`/${currentLocale}?category=${category.slug}`}
                          className={styles['dropdown-item-link']}
                          onClick={() => setActiveDropdown(null)}
                        >
                          {category.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
