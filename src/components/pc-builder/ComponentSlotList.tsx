'use client'

import { COMPONENT_SLOTS } from '@/utils/pc_build_items'
import ComponentSlotCard from './ComponentSlotCard'

interface SlotLabels {
  clear: string
  change: string
  choose: string
  noPart: string
}

interface ComponentSlotsListProps {
  selections: Record<string, any>
  currentLocale: string
  labels: SlotLabels
  onOpen: (slotKey: string) => void
  onRemove: (slotKey: string) => void
}

export default function ComponentSlotsList({
  selections,
  currentLocale,
  labels,
  onOpen,
  onRemove,
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
          onOpen={onOpen}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
