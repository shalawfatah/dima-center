'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isHamOpen, setIsHamOpen] = useState<boolean>(false)
  const [expandedMobileCategories, setExpandedMobileCategories] = useState<
    Record<string | number, boolean>
  >({})

  const navRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hamTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  const handleCloseHam = () => {
    setIsHamOpen(false)
  }

  const handleToggleHam = () => {
    setIsHamOpen((prev) => !prev)
  }

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

  // Standard scroll lock without scrollbar padding shifts
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
      handleCloseHam()
    }, 150)
  }

  const handleToggleDropdown = (index: number) => {
    setActiveDropdown((prev) => (prev === index ? null : index))
  }

  const toggleMobileCategory = (catKey: string | number) => {
    setExpandedMobileCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }))
  }

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
          {/* Hamburger Menu Wrapper */}
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

            <div
              className={`${styles['mobile-dropdown-panel']} ${
                isHamOpen ? styles['panel-open'] : styles['panel-closed']
              }`}
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
            </div>
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
    </>
  )
}
