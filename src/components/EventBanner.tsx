import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from '@/styles/event_banner.module.css'

export interface EventBannerProps {
  bannerData?: {
    isActive?: boolean
    bannerHeight?: 'small' | 'medium' | 'large'
    mediaType?: 'image' | 'svg' | 'video'
    textColor?: 'light' | 'dark'
    title?: string | Record<string, string>
    description?: string | Record<string, string>
    backgroundImage?:
      | {
          url?: string
          alt?: string
        }
      | string
    backgroundSvg?: string
    backgroundVideo?:
      | {
          url?: string
        }
      | string
    enableLink?: boolean
    linkUrl?: string
    linkLabel?: string | Record<string, string>
    openInNewTab?: boolean
  }
  currentLocale?: string
  isRtl?: boolean
}

/**
 * Resolves localized fields whether Payload returns plain string or localized object
 */
function resolveLocalizedText(val: any, preferredLocale?: string): string {
  if (!val) return ''
  if (typeof val === 'string') return val.trim()

  if (typeof val === 'object') {
    const loc = preferredLocale?.toLowerCase()
    if (loc && val[loc] && typeof val[loc] === 'string') {
      return val[loc].trim()
    }
    if (val.ckb && typeof val.ckb === 'string') return val.ckb.trim()
    if (val.ar && typeof val.ar === 'string') return val.ar.trim()
    if (val.en && typeof val.en === 'string') return val.en.trim()

    const firstStr = Object.values(val).find(
      (v) => typeof v === 'string' && v.trim().length > 0,
    ) as string | undefined

    if (firstStr) return firstStr.trim()
  }

  return ''
}

export const EventBanner: React.FC<EventBannerProps> = ({
  bannerData,
  currentLocale = 'en',
  isRtl: isRtlProp,
}) => {
  if (!bannerData || !bannerData.isActive) return null

  // Clean and normalize the locale string (e.g. handles 'ckb', 'ar', '/ckb/')
  const normalizedLocale = String(currentLocale)
    .toLowerCase()
    .replace(/[^a-z]/g, '')

  // 1. Determine direction strictly matching ckb and ar
  const isRtl =
    isRtlProp ??
    (normalizedLocale === 'ar' ||
      normalizedLocale === 'ckb' ||
      normalizedLocale.includes('ckb') ||
      normalizedLocale.includes('ar'))

  const directionClass = isRtl ? styles.rtl : styles.ltr

  const {
    bannerHeight = 'medium',
    mediaType = 'image',
    textColor = 'light',
    title,
    description,
    backgroundImage,
    backgroundSvg,
    backgroundVideo,
    enableLink,
    linkUrl,
    linkLabel,
    openInNewTab,
  } = bannerData

  // 2. Resolve Localized Texts safely
  const displayTitle = resolveLocalizedText(title, normalizedLocale)
  const displayDescription = resolveLocalizedText(description, normalizedLocale)
  const displayLinkLabel = resolveLocalizedText(linkLabel, normalizedLocale)

  // 3. Height class mapping
  const heightClass =
    bannerHeight === 'small'
      ? styles.heightSmall
      : bannerHeight === 'large'
        ? styles.heightLarge
        : styles.heightMedium

  // 4. Color & style mapping
  const isLight = textColor === 'light'
  const textClass = isLight ? styles.textLight : styles.textDark
  const overlayClass = isLight ? styles.overlayLight : styles.overlayDark
  const buttonClass = isLight ? styles.buttonLight : styles.buttonDark
  const titleSizeClass = bannerHeight === 'small' ? styles.titleSmall : styles.titleMediumLarge

  // 5. Extract media URLs
  const imageUrl = typeof backgroundImage === 'object' ? backgroundImage?.url : undefined
  const imageAlt =
    (typeof backgroundImage === 'object' ? backgroundImage?.alt : displayTitle) ||
    'Banner background'
  const videoUrl = typeof backgroundVideo === 'object' ? backgroundVideo?.url : undefined

  const ContentBody = (
    <div
      className={`${styles.contentLayer} ${textClass} ${directionClass}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: isRtl ? 'flex-end' : 'flex-start',
        textAlign: isRtl ? 'right' : 'left',
        width: '100%',
      }}
    >
      {displayTitle && (
        <h2
          className={`${styles.title} ${titleSizeClass}`}
          style={{ textAlign: isRtl ? 'right' : 'left', width: '100%' }}
        >
          {displayTitle}
        </h2>
      )}

      {displayDescription && (
        <p
          className={styles.description}
          style={{ textAlign: isRtl ? 'right' : 'left', width: '100%' }}
        >
          {displayDescription}
        </p>
      )}

      {enableLink && linkUrl && displayLinkLabel && (
        <span className={`${styles.ctaButton} ${buttonClass}`}>{displayLinkLabel}</span>
      )}
    </div>
  )

  return (
    <section
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`${styles.bannerContainer} ${heightClass} ${directionClass}`}
    >
      {/* BACKGROUND MEDIA LAYER */}
      <div className={styles.mediaLayer}>
        {mediaType === 'image' && imageUrl && (
          <Image src={imageUrl} alt={imageAlt} fill priority className={styles.mediaCover} />
        )}

        {mediaType === 'svg' &&
          backgroundSvg &&
          (backgroundSvg.trim().startsWith('<svg') ? (
            <div
              className={styles.svgWrapper}
              dangerouslySetInnerHTML={{ __html: backgroundSvg }}
            />
          ) : (
            <img src={backgroundSvg} alt="" className={styles.mediaCover} />
          ))}

        {mediaType === 'video' && videoUrl && (
          <video autoPlay loop muted playsInline className={styles.mediaCover}>
            <source src={videoUrl} />
          </video>
        )}

        <div className={overlayClass} />
      </div>

      {/* FOREGROUND CONTENT LAYER */}
      {enableLink && linkUrl ? (
        <Link
          href={linkUrl}
          target={openInNewTab ? '_blank' : '_self'}
          className={styles.linkWrapper}
        >
          {ContentBody}
        </Link>
      ) : (
        ContentBody
      )}
    </section>
  )
}
