'use client'

import { COMPONENT_SLOTS } from '@/utils/pc_build_items'
import ComponentSlotCard, { SlotLabels } from './ComponentSlotCard'

interface ComponentSlotsListProps {
  selections: Record<string, any>
  currentLocale: string
  labels: SlotLabels
  getLocalizedTitle: (product: any) => string
  onOpen: (slotKey: string) => void
  onRemove: (slotKey: string) => void
  onQuantityChange: (slotKey: string, delta: number) => void
}

export default function ComponentSlotsList({
  selections,
  currentLocale,
  labels,
  getLocalizedTitle,
  onOpen,
  onRemove,
  onQuantityChange,
}: ComponentSlotsListProps) {
  return (
    <div className="pc-builder-slots-list">
      {COMPONENT_SLOTS.map((slot) => (
        <ComponentSlotCard
          key={slot.key}
          slot={slot}
          chosenItem={selections[slot.key]}
          currentLocale={currentLocale}
          labels={labels}
          getLocalizedTitle={getLocalizedTitle}
          onOpen={onOpen}
          onRemove={onRemove}
          onQuantityChange={onQuantityChange}
        />
      ))}
    </div>
  )
}
