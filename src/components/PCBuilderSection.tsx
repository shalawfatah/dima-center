'use client'

import { PCBuilderSectionProps } from '@/types/types'
import { COPY } from '@/utils/pc_builder_section_copy'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/pc_builder_section.module.css'
import PCBuilderBottomSVG from './pc-builder/PCBuilderBottomSVG'
import type { Media } from '@/payload-types' // 👈 Import Payload's generated Media type

// 1. Combine Payload's Media interface with number, string, and null
type MediaItem = Media | string | number | null

interface ExtendedPCBuilderSectionProps extends PCBuilderSectionProps {
  backgroundImage?: MediaItem
  foregroundImage?: MediaItem
}

export default function PCBuilderSection({
  currentLocale,
  isRtl,
  backgroundImage,
  foregroundImage,
}: ExtendedPCBuilderSectionProps) {
  const isRegionalLocale = currentLocale === 'ar' || currentLocale === 'ckb'
  const titleFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const textFont = isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit'
  const copy = COPY[currentLocale] || COPY.en

  // 2. Safely extract string URL handling null/number/object cases
  const getImageUrl = (media?: MediaItem): string | null => {
    if (!media || typeof media === 'number') return null
    if (typeof media === 'string') return media
    if (typeof media === 'object' && media.url) return media.url
    return null
  }

  const bgUrl = getImageUrl(backgroundImage)
  const fgUrl = getImageUrl(foregroundImage)

  return (
    <section className={styles.section} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Image */}
      {bgUrl && (
        <Image
          src={bgUrl}
          alt="PC Builder Background"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 1200px"
          quality={90}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
      )}

      {/* Foreground Image Wrapper */}
      {fgUrl && (
        <div
          className={styles.visual}
          style={{
            position: 'absolute',
            zIndex: 2,
            opacity: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: '100%',
            ...(isRtl ? { right: 'auto', left: 20 } : { left: 'auto', right: 20 }),
          }}
        >
          <Image
            src={fgUrl}
            alt="PC Builder Foreground"
            width={240}
            height={240}
            style={{
              width: 'auto',
              height: '100%',
              maxHeight: '180px',
              objectFit: 'contain',
              opacity: 1,
            }}
          />
        </div>
      )}

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
