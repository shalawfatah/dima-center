'use client'

import Image from 'next/image'
import { getLocalizedTitle, getProductImageUrl } from './getLocalizedTitle'

interface SlotLabels {
  clear: string
  change: string
  choose: string
  noPart: string
}

interface ComponentSlotCardProps {
  slot: any
  chosenItem: any
  currentLocale: string
  labels: SlotLabels
  onOpen: (slotKey: string) => void
  onRemove: (slotKey: string) => void
}

export default function ComponentSlotCard({
  slot,
  chosenItem,
  currentLocale,
  labels,
  onOpen,
  onRemove,
}: ComponentSlotCardProps) {
  const itemImageUrl = getProductImageUrl(chosenItem)

  return (
    <div onClick={() => onOpen(slot.key)} className="pc-builder-component-card">
      <div className="pc-builder-card-meta">
        <div className="pc-builder-thumb-box">
          {itemImageUrl ? (
            <Image
              height={100}
              width={100}
              src={itemImageUrl}
              alt={getLocalizedTitle(chosenItem, currentLocale)}
              className="object-cover w-full h-full"
            />
          ) : (
            <Image
              height={50}
              width={50}
              src={(slot as any).defaultImage || `/categories/${slot.key}.png`}
              alt={slot.label}
              className="object-contain opacity-60 w-4/5 h-4/5"
            />
          )}
        </div>

        <div>
          <span className="pc-builder-slot-label">{slot.label}</span>
          {chosenItem ? (
            <div className="pc-builder-chosen-title">
              {getLocalizedTitle(chosenItem, currentLocale)}
              <span className="pc-builder-chosen-price">(${chosenItem.price})</span>
            </div>
          ) : (
            <div className="pc-builder-empty-slot">{labels.noPart}</div>
          )}
        </div>
      </div>

      <div className="pc-builder-actions-group">
        {chosenItem && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(slot.key)
            }}
            className="pc-builder-btn clear"
          >
            {labels.clear}
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpen(slot.key)
          }}
          className="pc-builder-btn action"
        >
          {chosenItem ? labels.change : labels.choose}
        </button>
      </div>
    </div>
  )
}
