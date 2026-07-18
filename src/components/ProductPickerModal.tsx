'use client'

import Image from 'next/image'
import Link from 'next/link'
import { COMPONENT_SLOTS } from '@/utils/pc_build_items'
import styles from '@/styles/pc_builder.module.css'

interface ModalLabels {
  modalSelectPrefix: string
  noItems: string
}

interface ProductPickerModalProps {
  activeModalSlot: string
  products: any[]
  currentLocale: string
  labels: ModalLabels
  getLocalizedTitle: (product: any) => string
  onSelect: (slotKey: string, product: any) => void
  onAddToCart: (product: any) => void
  onClose: () => void
}

export default function ProductPickerModal({
  activeModalSlot,
  products,
  currentLocale,
  labels,
  getLocalizedTitle,
  onSelect,
  onClose,
}: ProductPickerModalProps) {
  const currentSlotConfig = COMPONENT_SLOTS.find((s) => s.key === activeModalSlot)
  if (!currentSlotConfig) return null

  const filteredProducts = products.filter((prod) => {
    const prodCategory = prod.cat !== undefined ? prod.cat : prod.category
    if (!prodCategory) return false

    const targetSlug = currentSlotConfig.categorySlug.toLowerCase()
    const isSlugMatch = (backendVal: string, frontendSlug: string) => {
      const cleanB = backendVal.toLowerCase().trim()
      const cleanF = frontendSlug.toLowerCase().trim()
      return (
        cleanB === cleanF ||
        `${cleanB}s` === cleanF ||
        cleanB === `${cleanF}s` ||
        cleanB.replace(/-/g, '') === cleanF.replace(/-/g, '')
      )
    }

    if (typeof prodCategory === 'object' && prodCategory !== null) {
      const bSlug = prodCategory.slug || prodCategory.id || ''
      return isSlugMatch(String(bSlug), targetSlug)
    }
    return isSlugMatch(String(prodCategory), targetSlug)
  })

  return (
    <div className={styles['pc-builder-modal-overlay']} onClick={onClose}>
      <div className={styles['pc-builder-modal-window']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['pc-builder-modal-header']}>
          <h3 className={styles['pc-builder-modal-title']}>
            {labels.modalSelectPrefix} {currentSlotConfig.label}
          </h3>
          <button onClick={onClose} className={styles['pc-builder-modal-close']}>
            &times;
          </button>
        </div>

        <div className={styles['pc-builder-modal-body']}>
          {filteredProducts.length === 0 ? (
            <p className={styles['pc-builder-modal-empty']}>
              {labels.noItems} "{currentSlotConfig.categorySlug}".
            </p>
          ) : (
            filteredProducts.map((prod) => {
              const modalProductImg = prod?.featuredImage?.url || prod?.meta?.image?.url
              return (
                <div
                  key={prod.id}
                  onClick={() => onSelect(activeModalSlot, prod)}
                  className={styles['pc-builder-product-row']}
                >
                  <div className={styles['pc-builder-product-info']}>
                    <div className={styles['pc-builder-product-thumb']}>
                      {modalProductImg ? (
                        <Image
                          src={modalProductImg}
                          height={100}
                          sizes="100px"
                          width={100}
                          alt={getLocalizedTitle(prod)}
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <Image
                          height={45}
                          width={45}
                          sizes="45px"
                          src={`/categories/${currentSlotConfig.key}.png`}
                          alt={currentSlotConfig.label}
                          style={{ objectFit: 'contain' }}
                        />
                      )}
                    </div>
                    <span className={styles['pc-builder-product-title']}>
                      {getLocalizedTitle(prod)}
                    </span>
                  </div>

                  <div className={styles['pc-builder-actions-wrapper']}>
                    <span className={styles['pc-builder-product-price']}>${prod.price}</span>

                    <div className={styles['pc-builder-inline-icons-group']}>
                      <Link
                        href={`/${currentLocale}/products/${prod.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open Page"
                        onClick={(e) => e.stopPropagation()}
                        className={styles['pc-builder-icon-btn']}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#475569"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </Link>
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
