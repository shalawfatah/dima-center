import Image from 'next/image'
import { getDiscountedPrice } from '@/utils/pc_builder_pricing'
import styles from '@/styles/pc_builder.module.css'

const MULTI_QUANTITY_SLOTS = ['ram', 'storage', 'ssd', 'hdd', 'memory', 'm-2', 'm2']

export interface SlotLabels {
  clear?: string
  change?: string
  choose?: string
  noPart?: string
}

export interface ComponentSlotCardProps {
  slot: any
  chosenItem: any
  t?: Record<string, string>
  currentLocale?: string
  labels?: SlotLabels
  getLocalizedTitle: (product: any) => string
  onOpen: (slotKey: string) => void
  onRemove: (slotKey: string) => void
  onQuantityChange: (slotKey: string, delta: number) => void
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
}: ComponentSlotCardProps) {
  const itemImageUrl = chosenItem?.featuredImage?.url || chosenItem?.meta?.image?.url
  const qty = chosenItem?.quantity || 1

  const originalPrice = chosenItem ? (Number(chosenItem.price) || 0) * qty : 0
  const finalItemPrice = chosenItem ? getDiscountedPrice(chosenItem) * qty : 0
  const hasItemDiscount = chosenItem ? !!chosenItem.hasDiscount : false
  const isMultiSlot = MULTI_QUANTITY_SLOTS.includes(
    slot.key.toLowerCase() || slot.categorySlug.toLowerCase(),
  )

  const text = labels || (t as SlotLabels) || {}

  return (
    <div onClick={() => onOpen(slot.key)} className={styles['pc-builder-component-card']}>
      <div className={styles['pc-builder-card-meta']}>
        <div className={styles['pc-builder-thumb-box']}>
          {itemImageUrl ? (
            <Image
              sizes="100px"
              width="100"
              height="100"
              src={itemImageUrl}
              alt={getLocalizedTitle(chosenItem)}
              className={styles['pc-builder-thumb-image']}
            />
          ) : (
            <Image
              sizes="50px"
              width="100"
              height="100"
              className={styles['pc-builder-thumb-image']}
              src={(slot as any).defaultImage || `/categories/${slot.key.toLowerCase()}.png`}
              alt={slot.label}
            />
          )}
        </div>
        <div>
          <span className={styles['pc-builder-slot-label']}>{slot.label}</span>
          {chosenItem ? (
            <div className={styles['pc-builder-chosen-title']}>
              {qty > 1 && <strong className={styles['pc-builder-qty-highlight']}>{qty}x </strong>}
              {getLocalizedTitle(chosenItem)}{' '}
              <span className={styles['pc-builder-chosen-price']}>
                {hasItemDiscount ? (
                  <>
                    <span className={styles['pc-builder-price-original']}>(${originalPrice})</span>
                    <span className={styles['pc-builder-price-final']}>(${finalItemPrice})</span>
                  </>
                ) : (
                  <span>(${originalPrice})</span>
                )}
              </span>
            </div>
          ) : (
            <div className={styles['pc-builder-empty-slot']}>
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
            >
              -
            </button>
            <span className={styles['pc-builder-slot-qty-num']}>{qty}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(slot.key, 1)}
              className={styles['pc-builder-slot-qty-btn']}
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
        >
          {chosenItem ? text?.change || 'Change' : text?.choose || 'Choose'}
        </button>
      </div>
    </div>
  )
}
