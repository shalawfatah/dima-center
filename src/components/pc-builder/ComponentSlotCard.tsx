import Image from 'next/image'
import '@/styles/pc-builder-styles/component-slot-card.css'
import { ComponentSlotCardProps } from '@/types/types'

interface ExtendedComponentSlotCardProps extends ComponentSlotCardProps {
  boxTitleColor?: string
  boxBodyColor?: string
  boxPriceColor?: string
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
  boxTitleColor,
  boxBodyColor,
  boxPriceColor,
  bodyFont,
  boxBgColor,
  borderColor,
}: ExtendedComponentSlotCardProps) {
  const headingColor = boxTitleColor || titleColor || '#000000'
  const textColor = boxBodyColor || bodyColor || '#333333'
  const priceColor = boxPriceColor || '#10b981'
  const resolvedBoxBg = boxBgColor || '#ffffff'
  const resolvedBorderColor = borderColor || '#e2e8f0'

  const displayImage = chosenItem?.featuredImage?.url || slot.defaultImage

  const currentQty = chosenItem?.quantity || 1
  const maxStock = Number(chosenItem?.stock)
  const hasStockLimit = Number.isFinite(maxStock) && maxStock > 0
  const atMax = !!chosenItem && hasStockLimit && currentQty >= maxStock

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
              width={96}
              height={96}
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
            <div className="pc-builder-empty-slot" style={{ color: textColor, opacity: 0.6 }}>
              {t?.selectComponent || 'Select component'}
            </div>
          )}
        </div>
      </div>

      <div className="pc-builder-right-group" onClick={(e) => e.stopPropagation()}>
        {chosenItem && (
          <>
            <span className="pc-builder-chosen-price" style={{ color: priceColor }}>
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
                title={hasStockLimit ? `Max available: ${maxStock}` : undefined}
              >
                {currentQty}
              </span>
              <button
                type="button"
                className="pc-builder-btn action"
                onClick={() => onQuantityChange(slot.key, 1)}
                disabled={atMax}
                title={atMax ? `Max available: ${maxStock}` : undefined}
                style={{
                  fontFamily: bodyFont || 'inherit',
                  color: textColor,
                  backgroundColor: 'transparent',
                  border: `1px solid ${textColor}`,
                  opacity: atMax ? 0.35 : 1,
                  cursor: atMax ? 'not-allowed' : 'pointer',
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
