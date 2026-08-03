'use client'

import Image from 'next/image'
import styles from '@/styles/pc_builder.module.css'
import { COMPONENT_SLOTS } from '@/utils/pc_build_items'

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
  onAddToCart,
  onClose,
  titleColor,
  bodyColor,
  headingFont,
  bodyFont,
  boxBgColor,
  borderColor,
}: ProductPickerModalProps) {
  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'
  const resolvedBoxBg = boxBgColor || '#ffffff'
  const resolvedBorderColor = borderColor || '#e2e8f0'

  // Find the slot definition
  const slot = COMPONENT_SLOTS.find((s) => s.key === activeModalSlot)

  // Filter products by category if slot has categorySlug filter
  const filteredProducts = slot?.categorySlug
    ? products.filter((p) => p.category === slot.categorySlug || p.cat === slot.categorySlug)
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
              return (
                <div
                  key={product.id}
                  className={styles['pc-builder-product-row']}
                  style={{
                    backgroundColor: isSelected ? '#e2e8f0' : resolvedBoxBg,
                    borderColor: resolvedBorderColor,
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
                    </div>
                  </div>
                  <div className={styles['pc-builder-product-actions-wrapper']}>
                    <button
                      type="button"
                      className={`${styles['pc-builder-btn']} ${styles.action}`}
                      onClick={() => onAddToCart(product)}
                      style={{
                        fontFamily: bodyFont || 'inherit',
                        color: textColor,
                      }}
                    >
                      Add to Cart
                    </button>
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
