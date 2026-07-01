import React from 'react'

interface LocalizedHeadingProps {
  currentLocale: string
  activeCategoryTitle?: string
  en: string
  ar: string
  ckb: string
  style?: React.CSSProperties
}

export default function LocalizedHeading({
  currentLocale,
  activeCategoryTitle,
  en,
  ar,
  ckb,
  style,
}: LocalizedHeadingProps) {
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  // Resolve localized fallback string
  const fallbackText = currentLocale === 'en' ? en : currentLocale === 'ar' ? ar : ckb

  return (
    <h2
      style={{
        fontFamily: '"Rudaw", sans-serif',
        color: '#1e293b',
        fontSize: '1.65rem',
        marginBottom: '1.5rem',
        fontWeight: '700',
        textAlign: isRtl ? 'right' : 'left',
        ...style, // Allows local structural overrides if needed
      }}
    >
      {activeCategoryTitle ? activeCategoryTitle : fallbackText}
    </h2>
  )
}
