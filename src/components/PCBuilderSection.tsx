'use client'

import { PCBuilderSectionProps } from '@/types/types'
import { COPY } from '@/utils/pc_builder_section_copy'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/pc_builder_section.module.css'
import PCBuilderBottomSVG from './pc-builder/PCBuilderBottomSVG'
import type { Media } from '@/payload-types'

type MediaItem = Media | string | number | null

interface ExtendedPCBuilderSectionProps extends PCBuilderSectionProps {
  backgroundImage?: MediaItem
  foregroundImage?: MediaItem
  headingFont?: string
  bodyFont?: string
  dynamicFontFaceCSS?: string
}

export default function PCBuilderSection({
  currentLocale,
  isRtl,
  backgroundImage,
  foregroundImage,
  headingFont,
  bodyFont,
  dynamicFontFaceCSS,
}: ExtendedPCBuilderSectionProps) {
  const isRegionalLocale = currentLocale === 'ar' || currentLocale === 'ckb'

  const titleFont = headingFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')
  const textFont = bodyFont || (isRegionalLocale ? '"Rudaw", sans-serif' : 'inherit')

  const copy = COPY[currentLocale] || COPY.en

  const getImageUrl = (media?: MediaItem): string | null => {
    if (!media || typeof media === 'number') return null
    if (typeof media === 'string') return media
    if (typeof media === 'object' && media.url) return media.url
    return null
  }

  const bgUrl = getImageUrl(backgroundImage)
  const fgUrl = getImageUrl(foregroundImage)

  return (
    <>
      {dynamicFontFaceCSS && <style dangerouslySetInnerHTML={{ __html: dynamicFontFaceCSS }} />}

      <section className={styles.section} dir="ltr">
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

        {fgUrl && (
          <div
            className={styles.visual}
            style={{ left: 0, right: 'auto', marginLeft: 0, marginRight: 'auto' }}
          >
            <Image
              src={fgUrl}
              alt="PC Builder Foreground"
              width={240}
              height={240}
              className={styles.fgImage}
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
    </>
  )
}
