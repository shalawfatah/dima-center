import Image from 'next/image'
import '@/styles/pc-builder-styles/component-slot-card.css'
import { ComponentSlotCardProps } from '@/types/types'

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

  const displayImage = chosenItem?.featuredImage?.url || slot.defaultImage

  return (
    <div
      className="pc-builder-component-card"
      onClick={() => onOpen(slot.key)}
      style={{
        backgroundColor: resolvedBoxBg,
        borderColor: resolvedBorderColor,
      }}
    >
      <div className="pc-builder-card-meta">
        {displayImage && (
          <div className="pc-builder-thumb-box">
            <Image
              src={displayImage}
              alt={chosenItem?.title ?? slot.label}
              width={32}
              height={32}
              className="object-contain pc-builder-thumb-img"
            />
          </div>
        )}
        <div className="pc-builder-slot-info">
          <span className="pc-builder-slot-label" style={{ color: textColor }}>
            {slot.label}
          </span>
          {chosenItem ? (
            <div className="pc-builder-chosen-title" style={{ color: headingColor }}>
              {getLocalizedTitle(chosenItem)}
            </div>
          ) : (
            <div className="pc-builder-empty-slot" style={{ color: '#94a3b8' }}>
              {t?.selectComponent || 'Select component'}
            </div>
          )}
        </div>
      </div>

      <div className="pc-builder-right-group" onClick={(e) => e.stopPropagation()}>
        {chosenItem && (
          <>
            <span className="pc-builder-chosen-price" style={{ color: '#10b981' }}>
              ${chosenItem.price}
            </span>
            <div className="pc-builder-actions-group">
              <button
                type="button"
                className="pc-builder-btn action"
                onClick={() => onQuantityChange(slot.key, -1)}
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
                  fontSize: '14px',
                }}
              >
                {chosenItem.quantity || 1}
              </span>
              <button
                type="button"
                className="pc-builder-btn action"
                onClick={() => onQuantityChange(slot.key, 1)}
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
                className="pc-builder-btn clear"
                onClick={() => onRemove(slot.key)}
              >
                x
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
