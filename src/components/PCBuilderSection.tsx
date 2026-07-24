'use client'

import { PCBuilderSectionProps } from '@/types/types'
import { COPY } from '@/utils/pc_builder_section_copy'
import Link from 'next/link'
import styles from '@/styles/pc_builder_section.module.css'
import PCBuilderTopSVG from './pc-builder/PCBuilderTopSVG'
import PCbuilderMiddleSVG from './pc-builder/PCBuilderMiddleSVG'
import PCBuilderBottomSVG from './pc-builder/PCBuilderBottomSVG'

export default function PCBuilderSection({ currentLocale, isRtl }: PCBuilderSectionProps) {
  const isRegionalLocale = currentLocale === 'ar' || currentLocale === 'ckb'
  const titleFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const textFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const copy = COPY[currentLocale] || COPY.en

  return (
    <section className={styles.section} dir={isRtl ? 'rtl' : 'ltr'}>
      <PCBuilderTopSVG />
      <div className={styles.visual} style={isRtl ? { right: 'auto', left: -40 } : undefined}>
        <PCbuilderMiddleSVG />
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
              <PCBuilderBottomSVG isRtl={isRtl} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
