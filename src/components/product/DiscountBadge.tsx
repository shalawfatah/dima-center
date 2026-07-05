interface DiscountBadgeProps {
  badgeText: string
  currentLocale: string
  isRtl: boolean
  size?: 'large' | 'small'
  // The main product image badge localizes the "OFF" word; the related-card
  // badges in the original markup did not. Kept as a flag so behavior matches
  // exactly rather than silently changing the related cards' copy.
  localizeOffLabel?: boolean
}

const offLabel: Record<string, string> = {
  ar: 'خصم',
  ckb: 'داشکانـدن',
  en: 'OFF',
}

export default function DiscountBadge({
  badgeText,
  currentLocale,
  isRtl,
  size = 'large',
  localizeOffLabel = true,
}: DiscountBadgeProps) {
  const isSmall = size === 'small'

  return (
    <span
      style={{
        position: 'absolute',
        top: isSmall ? '8px' : '16px',
        left: isRtl ? 'auto' : isSmall ? '8px' : '16px',
        right: isRtl ? (isSmall ? '8px' : '16px') : 'auto',
        background: '#ef4444',
        color: '#fff',
        fontSize: isSmall ? '10px' : '12px',
        fontWeight: '700',
        padding: isSmall ? '2px 6px' : '6px 12px',
        borderRadius: isSmall ? '4px' : '6px',
        zIndex: isSmall ? 5 : 10,
      }}
    >
      {badgeText} {localizeOffLabel ? offLabel[currentLocale] || offLabel.en : 'OFF'}
    </span>
  )
}
