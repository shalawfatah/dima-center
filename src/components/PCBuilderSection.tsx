'use client'

import { PCBuilderSectionProps } from '@/types/types'
import { COPY } from '@/utils/pc_builder_section_copy'
import Link from 'next/link'
import styles from '@/styles/pc_builder_section.module.css'

export default function PCBuilderSection({ currentLocale, isRtl }: PCBuilderSectionProps) {
  const isRegionalLocale = currentLocale === 'ar' || currentLocale === 'ckb'
  const titleFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const textFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const copy = COPY[currentLocale] || COPY.en

  return (
    <section className={styles.section} dir={isRtl ? 'rtl' : 'ltr'}>
      <svg
        aria-hidden="true"
        className={styles.grid}
        viewBox="0 0 800 120"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="pcb-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M30 0 L0 0 0 30" fill="none" stroke="#ffb83c" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="800" height="120" fill="url(#pcb-grid)" />
      </svg>

      <div className={styles.visual} style={isRtl ? { right: 'auto', left: -40 } : undefined}>
        <svg viewBox="0 0 300 100" width="100%" height="100%" className={styles.visualSvg}>
          <rect
            x="130"
            y="25"
            width="50"
            height="50"
            fill="none"
            stroke="#ffb83c"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <rect
            x="140"
            y="35"
            width="30"
            height="30"
            fill="rgba(255,184,60,0.06)"
            stroke="#ffb83c"
            strokeWidth="1"
          />

          <path d="M130 40 H70 V15" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />
          <path d="M130 60 H60 V85" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />
          <path d="M180 40 H240 V20" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />
          <path d="M180 60 H230 V80" fill="none" stroke="#ffb83c" strokeWidth="1" opacity="0.3" />

          <circle className={styles.node} cx="70" cy="15" r="2.5" fill="#ffb83c" />
          <circle className={styles.node} cx="60" cy="85" r="2.5" fill="#ffb83c" />
          <circle className={styles.node} cx="240" cy="20" r="2.5" fill="#ffb83c" />
          <circle className={styles.node} cx="230" cy="80" r="2.5" fill="#ffb83c" />
        </svg>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.headerRow}>
            <h2 className={styles.heading} style={{ fontFamily: titleFont }}>
              {copy.heading}
            </h2>

            <Link
              href={`/${currentLocale}/pc-builder`}
              className={styles.cta}
              style={{ fontFamily: textFont }}
            >
              {copy.cta}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }}
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
