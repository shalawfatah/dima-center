import Image from 'next/image'
import { getDiscountedPrice } from '@/utils/pc_builder_pricing'
import styles from '@/styles/pc_builder.module.css'
import { ComponentSlotCardProps, SlotLabels } from '@/types/types'

const MULTI_QUANTITY_SLOTS = ['ram', 'storage', 'ssd', 'hdd', 'memory', 'm-2', 'm2']

// Helper to check if a URL comes from our trusted domain or local public directory
function isTrustedDomain(url: string | null | undefined): boolean {
  if (!url) return false
  if (url.startsWith('/')) return true // Local images (/categories/ram.png, etc.)
  // Allow your VPS / S3 domain
  if (url.includes('s3.dima.center')) return true
  return false
}

interface ExtendedComponentSlotCardProps extends ComponentSlotCardProps {
  titleColor?: string
  bodyColor?: string
  headingFont?: string
  bodyFont?: string
}

export default function ComponentSlotCard({
  slot,
  chosenItem,
  t,
  labels,
  getLocalizedTitle,
  onOpen,
  onRemove,
  onQuantityChange,
  titleColor,
  bodyColor,
  headingFont,
  bodyFont,
}: ExtendedComponentSlotCardProps) {
  const itemImageUrl = chosenItem?.featuredImage?.url || chosenItem?.meta?.image?.url
  const qty = chosenItem?.quantity || 1

  const originalPrice = chosenItem ? (Number(chosenItem.price) || 0) * qty : 0
  const finalItemPrice = chosenItem ? getDiscountedPrice(chosenItem) * qty : 0
  const hasItemDiscount = chosenItem ? !!chosenItem.hasDiscount : false

  // Safe key extraction
  const slotKey = (slot?.key || slot?.categorySlug || '').toLowerCase()
  const isMultiSlot = MULTI_QUANTITY_SLOTS.includes(slotKey)

  const text = labels || (t as SlotLabels) || {}

  // Local static icon path from /public/categories/
  const fallbackCategoryIcon =
    (slot as any)?.defaultImage || `/categories/${slotKey || 'default'}.png`

  const isTrustedImage = isTrustedDomain(itemImageUrl)

  // Use provided colors or fallbacks
  const headingColor = titleColor || '#000000'
  const textColor = bodyColor || '#333333'
  const titleFont = headingFont || 'inherit'
  const bodyFontFamily = bodyFont || 'inherit'

  return (
    <div
      onClick={() => onOpen(slot.key)}
      className={styles['pc-builder-component-card']}
      style={
        {
          '--slot-heading-color': headingColor,
          '--slot-body-color': textColor,
          '--slot-heading-font': titleFont,
          '--slot-body-font': bodyFontFamily,
        } as React.CSSProperties
      }
    >
      <div className={styles['pc-builder-card-meta']}>
        <div className={styles['pc-builder-thumb-box']}>
          {itemImageUrl ? (
            /* Safe rendering: Use unoptimized mode if it's an old legacy URL (like Supabase) */
            <Image
              sizes="100px"
              width={100}
              height={100}
              src={itemImageUrl}
              alt={getLocalizedTitle(chosenItem) || 'Component Image'}
              className={styles['pc-builder-thumb-image']}
              style={{ width: 'auto', height: 'auto' }}
              unoptimized={!isTrustedImage}
            />
          ) : (
            /* Static icon served directly from /public */
            <Image
              sizes="50px"
              width={100}
              height={100}
              src={fallbackCategoryIcon}
              alt={slot.label || 'Category Icon'}
              className={styles['pc-builder-thumb-image']}
              style={{ width: 'auto', height: 'auto' }}
            />
          )}
        </div>

        <div>
          <span
            className={styles['pc-builder-slot-label']}
            style={{
              color: 'var(--slot-heading-color)',
              fontFamily: 'var(--slot-heading-font)',
            }}
          >
            {slot.label}
          </span>
          {chosenItem ? (
            <div
              className={styles['pc-builder-chosen-title']}
              style={{
                color: 'var(--slot-body-color)',
                fontFamily: 'var(--slot-body-font)',
              }}
            >
              {qty > 1 && <strong className={styles['pc-builder-qty-highlight']}>{qty}x </strong>}
              {getLocalizedTitle(chosenItem)}{' '}
              <span className={styles['pc-builder-chosen-price']}>
                {hasItemDiscount ? (
                  <>
                    <span
                      className={styles['pc-builder-price-original']}
                      style={{ color: 'var(--slot-body-color)' }}
                    >
                      (${originalPrice})
                    </span>
                    <span
                      className={styles['pc-builder-price-final']}
                      style={{ color: 'var(--slot-heading-color)' }}
                    >
                      (${finalItemPrice})
                    </span>
                  </>
                ) : (
                  <span style={{ color: 'var(--slot-body-color)' }}>(${originalPrice})</span>
                )}
              </span>
            </div>
          ) : (
            <div
              className={styles['pc-builder-empty-slot']}
              style={{
                color: 'var(--slot-body-color)',
                fontFamily: 'var(--slot-body-font)',
              }}
            >
              {text?.noPart || 'No Part Selected'}
            </div>
          )}
        </div>
      </div>

      <div className={styles['pc-builder-actions-group']}>
        {chosenItem && isMultiSlot && (
          <div className={styles['pc-builder-main-stepper']} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onQuantityChange(slot.key, -1)}
              className={styles['pc-builder-slot-qty-btn']}
              disabled={qty <= 1}
              style={{ color: 'var(--slot-body-color)' }}
            >
              -
            </button>
            <span
              className={styles['pc-builder-slot-qty-num']}
              style={{
                color: 'var(--slot-body-color)',
                fontFamily: 'var(--slot-body-font)',
              }}
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(slot.key, 1)}
              className={styles['pc-builder-slot-qty-btn']}
              style={{ color: 'var(--slot-body-color)' }}
            >
              +
            </button>
          </div>
        )}

        {chosenItem && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(slot.key)
            }}
            className={`${styles['pc-builder-btn']} ${styles.clear}`}
            style={{
              color: 'var(--slot-body-color)',
              fontFamily: 'var(--slot-body-font)',
            }}
          >
            {text?.clear || 'Clear'}
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpen(slot.key)
          }}
          className={`${styles['pc-builder-btn']} ${styles.action}`}
          style={{
            color: 'var(--slot-body-color)',
            fontFamily: 'var(--slot-body-font)',
          }}
        >
          {chosenItem ? text?.change || 'Change' : text?.choose || 'Choose'}
        </button>
      </div>
    </div>
  )
}
