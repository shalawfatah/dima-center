'use client'

import Image from 'next/image'
import { COMPONENT_SLOTS } from '@/utils/pc_build_items'
import { checkCompatibilityByTitle } from '@/utils/pc_compatibility'
import styles from '@/styles/pc_builder.module.css'
import { ProductPickerModalProps } from '@/types/types'
import OpenLinkBtn from './pc-builder/OpenLinkBtn'

interface ExtendedProductPickerModalProps extends ProductPickerModalProps {
  selections?: Record<string, any>
}

export default function ProductPickerModal({
  activeModalSlot,
  products,
  currentLocale,
  labels,
  getLocalizedTitle,
  onSelect,
  onClose,
  selections = {},
}: ExtendedProductPickerModalProps) {
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

  // Format selections so each selected slot passes a { title: string } object
  const formattedSelections: Record<string, { title: string }> = {}
  Object.entries(selections).forEach(([slotKey, item]) => {
    if (item) {
      formattedSelections[slotKey] = {
        title: getLocalizedTitle(item) || item.title || '',
      }
    }
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
              const displayTitle = getLocalizedTitle(prod) || prod?.title || ''

              // Run title parsing compatibility check
              const { isCompatible, reason } = checkCompatibilityByTitle(
                { title: displayTitle },
                activeModalSlot,
                formattedSelections,
              )

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (isCompatible) {
                      onSelect(activeModalSlot, prod)
                    }
                  }}
                  className={`${styles['pc-builder-product-row']} ${
                    !isCompatible ? styles['incompatible'] || 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className={styles['pc-builder-product-info']}>
                    <div className={styles['pc-builder-product-thumb']}>
                      {modalProductImg ? (
                        <Image
                          src={modalProductImg}
                          sizes="100px"
                          width="100"
                          height="100"
                          alt={displayTitle}
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <Image
                          sizes="45px"
                          width="45"
                          height="45"
                          src={`/categories/${currentSlotConfig.key}.png`}
                          alt={currentSlotConfig.label}
                          style={{ objectFit: 'contain' }}
                        />
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className={styles['pc-builder-product-title']}>{displayTitle}</span>
                      {!isCompatible && (
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px' }}>
                          ⚠️ {reason}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles['pc-builder-actions-wrapper']}>
                    <span className={styles['pc-builder-product-price']}>${prod.price}</span>
                    <OpenLinkBtn link={`/${currentLocale}/products/${prod.id}`} />
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
