import React from 'react'

interface LocalizedHeadingProps {
  currentLocale: string
  activeCategoryTitle?: string
  en: string
  ar: string
  ckb: string
  style?: React.CSSProperties
  headingFont?: string
}

export default function LocalizedHeading({
  currentLocale,
  activeCategoryTitle,
  en,
  ar,
  ckb,
  style,
  headingFont,
}: LocalizedHeadingProps) {
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  const fallbackText = currentLocale === 'en' ? en : currentLocale === 'ar' ? ar : ckb

  // Use the provided headingFont, or fallback to default
  const titleFont = headingFont || (isRtl ? '"Rudaw", sans-serif' : 'inherit')

  return (
    <h2
      style={{
        fontFamily: titleFont,
        fontSize: '1.65rem',
        marginBottom: '1.5rem',
        fontWeight: '700',
        textAlign: isRtl ? 'right' : 'left',
        ...style,
      }}
    >
      {activeCategoryTitle ? activeCategoryTitle : fallbackText}
    </h2>
  )
}
