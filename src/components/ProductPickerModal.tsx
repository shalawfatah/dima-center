import Image from 'next/image'
import '@/styles/pc-builder-styles/product-picker-modal.css'
import { COMPONENT_SLOTS } from '@/utils/pc_build_items'
import { checkCompatibility } from '@/utils/pc_compatibility'
import { ProductPickerModalProps } from '@/types/types'

export default function ProductPickerModal({
  activeModalSlot,
  products,
  labels,
  selections,
  getLocalizedTitle,
  onSelect,
  onClose,
  titleColor,
  bodyColor,
  boxTitleColor,
  boxBodyColor,
  boxPriceColor,
  headingFont,
  bodyFont,
  boxBgColor,
  borderColor,
}: ProductPickerModalProps) {
  const headingColor = boxTitleColor || titleColor || '#000000'
  const textColor = boxBodyColor || bodyColor || '#333333'
  const priceColor = boxPriceColor || '#10b981'
  const resolvedBoxBg = boxBgColor || '#ffffff'
  const resolvedBorderColor = borderColor || '#e2e8f0'

  const slot = COMPONENT_SLOTS.find((s) => s.key === activeModalSlot)

  const filteredProducts = slot?.categorySlug
    ? products.filter((p) => {
        const getCatValue = (val: any) => {
          if (!val) return ''
          if (typeof val === 'object') {
            return val.slug || val.key || val.id || val.title || ''
          }
          return String(val)
        }

        const pCat = getCatValue(p.category).toLowerCase()
        const pCatAlt = getCatValue(p.cat).toLowerCase()
        const targetSlug = slot.categorySlug.toLowerCase()

        // Special fallback rule for storage slot to catch m.2, ssd, hdd, storage variations
        if (activeModalSlot === 'm-2') {
          return (
            pCat.includes('storage') ||
            pCat.includes('ssd') ||
            pCat.includes('hdd') ||
            pCat.includes('m.2') ||
            pCat.includes('m-2') ||
            pCatAlt.includes('storage') ||
            pCatAlt.includes('ssd') ||
            pCatAlt.includes('hdd') ||
            pCatAlt.includes('m.2') ||
            pCatAlt.includes('m-2')
          )
        }

        return pCat === targetSlug || pCatAlt === targetSlug
      })
    : products

  return (
    <div className="pc-builder-modal-overlay" onClick={onClose}>
      <div
        className="pc-builder-modal-window"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: resolvedBoxBg,
          borderColor: resolvedBorderColor,
        }}
      >
        <div
          className="pc-builder-modal-header"
          style={{
            borderBottomColor: resolvedBorderColor,
          }}
        >
          <h3
            className="pc-builder-modal-title"
            style={{
              color: headingColor,
              fontFamily: headingFont || 'inherit',
            }}
          >
            {labels.modalSelectPrefix} {slot?.label || activeModalSlot}
          </h3>
          <button className="pc-builder-modal-close" onClick={onClose} style={{ color: textColor }}>
            ✕
          </button>
        </div>
        <div className="pc-builder-modal-body">
          {filteredProducts.length === 0 ? (
            <div className="pc-builder-modal-empty" style={{ color: textColor }}>
              {labels.noItems}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isSelected = selections[activeModalSlot]?.id === product.id
              const compatibility = checkCompatibility(product, activeModalSlot, selections)

              return (
                <div
                  key={product.id}
                  className="pc-builder-product-row"
                  onClick={() => onSelect(activeModalSlot, product)}
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--pc-box-bg-secondary, #f1f5f9)'
                      : resolvedBoxBg,
                    borderColor: resolvedBorderColor,
                    opacity: compatibility.isCompatible ? 1 : 0.65,
                  }}
                >
                  <div className="pc-builder-product-info">
                    {product.featuredImage?.url && (
                      <div className="pc-builder-product-thumb">
                        <Image
                          src={product.featuredImage.url}
                          alt={product.title}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div className="pc-builder-product-details">
                      <div
                        className="pc-builder-product-title"
                        style={{ color: headingColor, fontFamily: bodyFont || 'inherit' }}
                      >
                        {getLocalizedTitle(product)}
                      </div>
                      {!compatibility.isCompatible && compatibility.reason && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#ef4444',
                            marginTop: '2px',
                            fontWeight: 500,
                          }}
                        >
                          ⚠️ {compatibility.reason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pc-builder-product-right-group">
                    <span className="pc-builder-product-price" style={{ color: priceColor }}>
                      ${product.price}
                    </span>
                    <div className="pc-builder-product-actions-wrapper">
                      {isSelected && (
                        <span style={{ color: priceColor, fontWeight: 600, fontSize: '13px' }}>
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
