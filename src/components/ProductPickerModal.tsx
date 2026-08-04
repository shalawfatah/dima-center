'use client'

import Image from 'next/image'
import styles from '@/styles/pc_builder.module.css'
import { COMPONENT_SLOTS } from '@/utils/pc_build_items'
import { checkCompatibility } from '@/utils/pc_compatibility'

interface ProductPickerModalProps {
  activeModalSlot: string
  products: any[]
  currentLocale: string
  labels: { modalSelectPrefix: string; noItems: string }
  selections: Record<string, any>
  getLocalizedTitle: (product: any) => string
  onSelect: (slotKey: string, product: any) => void
  onAddToCart: (product: any) => void
  onClose: () => void
  titleColor?: string
  bodyColor?: string
  headingFont?: string
  bodyFont?: string
  boxBgColor?: string
  borderColor?: string
}

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
  headingFont,
  boxBgColor,
  borderColor,
}: ProductPickerModalProps) {
  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'
  const resolvedBoxBg = boxBgColor || '#ffffff'
  const resolvedBorderColor = borderColor || '#e2e8f0'

  // Find the slot definition
  const slot = COMPONENT_SLOTS.find((s) => s.key === activeModalSlot)

  // Filter products by category safely
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

        return pCat === targetSlug || pCatAlt === targetSlug
      })
    : products

  return (
    <div className={styles['pc-builder-modal-overlay']} onClick={onClose}>
      <div
        className={styles['pc-builder-modal-window']}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: resolvedBoxBg,
          borderColor: resolvedBorderColor,
        }}
      >
        <div
          className={styles['pc-builder-modal-header']}
          style={{
            borderBottomColor: resolvedBorderColor,
          }}
        >
          <h3
            className={styles['pc-builder-modal-title']}
            style={{
              color: headingColor,
              fontFamily: headingFont || 'inherit',
            }}
          >
            {labels.modalSelectPrefix} {slot?.label || activeModalSlot}
          </h3>
          <button
            className={styles['pc-builder-modal-close']}
            onClick={onClose}
            style={{ color: textColor }}
          >
            ✕
          </button>
        </div>
        <div className={styles['pc-builder-modal-body']}>
          {filteredProducts.length === 0 ? (
            <div className={styles['pc-builder-modal-empty']} style={{ color: textColor }}>
              {labels.noItems}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isSelected = selections[activeModalSlot]?.id === product.id

              // 🔍 Run compatibility evaluation for this product
              const compatibility = checkCompatibility(product, activeModalSlot, selections)

              return (
                <div
                  key={product.id}
                  className={styles['pc-builder-product-row']}
                  style={{
                    backgroundColor: isSelected ? '#e2e8f0' : resolvedBoxBg,
                    borderColor: resolvedBorderColor,
                    opacity: compatibility.isCompatible ? 1 : 0.65, // Dim incompatible parts slightly
                  }}
                >
                  <div
                    className={styles['pc-builder-product-info']}
                    onClick={() => onSelect(activeModalSlot, product)}
                  >
                    {product.featuredImage?.url && (
                      <div className={styles['pc-builder-product-thumb']}>
                        <Image
                          src={product.featuredImage.url}
                          alt={product.title}
                          width={45}
                          height={45}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <div
                        className={styles['pc-builder-product-title']}
                        style={{ color: headingColor }}
                      >
                        {getLocalizedTitle(product)}
                      </div>
                      <div
                        className={styles['pc-builder-product-price']}
                        style={{ color: '#10b981' }}
                      >
                        ${product.price}
                      </div>

                      {/* ⚠️ Render compatibility warning message if incompatible */}
                      {!compatibility.isCompatible && compatibility.reason && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#ef4444',
                            marginTop: '4px',
                            fontWeight: 500,
                          }}
                        >
                          ⚠️ {compatibility.reason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles['pc-builder-product-actions-wrapper']}>
                    {isSelected && (
                      <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Selected</span>
                    )}
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
