import Image from 'next/image'
import styles from '@/styles/pc_builder.module.css'

interface ComponentSlotCardProps {
  slot: any
  chosenItem: any
  t: Record<string, string>
  getLocalizedTitle: (product: any) => string
  onOpen: (key: string) => void
  onRemove: (key: string) => void
  onQuantityChange: (key: string, delta: number) => void
  titleColor?: string
  bodyColor?: string
  headingFont?: string
  bodyFont?: string
  boxBgColor?: string
  borderColor?: string
}

export default function ComponentSlotCard({
  slot,
  chosenItem,
  t,
  getLocalizedTitle,
  onOpen,
  onRemove,
  onQuantityChange,
  titleColor,
  bodyColor,
  bodyFont,
  boxBgColor,
  borderColor,
}: ComponentSlotCardProps) {
  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'
  const resolvedBoxBg = boxBgColor || '#ffffff'
  const resolvedBorderColor = borderColor || '#e2e8f0'

  return (
    <div
      className={styles['pc-builder-component-card']}
      onClick={() => onOpen(slot.key)}
      style={{
        backgroundColor: resolvedBoxBg,
        borderColor: resolvedBorderColor,
      }}
    >
      <div className={styles['pc-builder-card-meta']}>
        {chosenItem?.featuredImage?.url && (
          <div className={styles['pc-builder-thumb-box']}>
            <Image
              src={chosenItem.featuredImage.url}
              alt={chosenItem.title}
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
        )}
        <div>
          <span className={styles['pc-builder-slot-label']} style={{ color: textColor }}>
            {slot.label}
          </span>
          {chosenItem ? (
            <div className={styles['pc-builder-chosen-title']} style={{ color: headingColor }}>
              {getLocalizedTitle(chosenItem)}
              <span className={styles['pc-builder-chosen-price']} style={{ color: '#10b981' }}>
                ${chosenItem.price}
              </span>
            </div>
          ) : (
            <div className={styles['pc-builder-empty-slot']} style={{ color: '#94a3b8' }}>
              {t.selectComponent || 'Select component'}
            </div>
          )}
        </div>
      </div>
      {chosenItem && (
        <div className={styles['pc-builder-actions-group']}>
          <button
            type="button"
            className={`${styles['pc-builder-btn']} ${styles.action}`}
            onClick={(e) => {
              e.stopPropagation()
              onQuantityChange(slot.key, -1)
            }}
            style={{
              fontFamily: bodyFont || 'inherit',
              color: textColor,
              backgroundColor: 'transparent',
              border: `1px solid ${textColor}`,
            }}
          >
            -
          </button>
          <span
            style={{
              color: textColor,
              fontFamily: bodyFont || 'inherit',
              fontWeight: 600,
            }}
          >
            {chosenItem.quantity || 1}
          </span>
          <button
            type="button"
            className={`${styles['pc-builder-btn']} ${styles.action}`}
            onClick={(e) => {
              e.stopPropagation()
              onQuantityChange(slot.key, 1)
            }}
            style={{
              fontFamily: bodyFont || 'inherit',
              color: textColor,
              backgroundColor: 'transparent',
              border: `1px solid ${textColor}`,
            }}
          >
            +
          </button>
          <button
            type="button"
            className={`${styles['pc-builder-btn']} ${styles.clear}`}
            onClick={(e) => {
              e.stopPropagation()
              onRemove(slot.key)
            }}
            style={{
              fontFamily: bodyFont || 'inherit',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
