'use client'

import { COMPONENT_SLOTS } from '@/utils/pc_build_items'
import ComponentSlotCard from './ComponentSlotCard'

interface ComponentSlotsListProps {
  selections: Record<string, any>
  currentLocale: string
  t: Record<string, string> // Use the translation object instead of labels
  getLocalizedTitle: (product: any) => string
  onOpen: (slotKey: string) => void
  onRemove: (slotKey: string) => void
  onQuantityChange: (slotKey: string, delta: number) => void
  titleColor?: string
  bodyColor?: string
  headingFont?: string
  bodyFont?: string
  boxBgColor?: string
  borderColor?: string
}

export default function ComponentSlotsList({
  selections,
  t,
  getLocalizedTitle,
  onOpen,
  onRemove,
  onQuantityChange,
  titleColor,
  bodyColor,
  headingFont,
  bodyFont,
  boxBgColor,
  borderColor,
}: ComponentSlotsListProps) {
  return (
    <div className="pc-builder-slots-list">
      {COMPONENT_SLOTS.map((slot) => (
        <ComponentSlotCard
          key={slot.key}
          slot={slot}
          chosenItem={selections[slot.key]}
          t={t}
          getLocalizedTitle={getLocalizedTitle}
          onOpen={onOpen}
          onRemove={onRemove}
          onQuantityChange={onQuantityChange}
          titleColor={titleColor}
          bodyColor={bodyColor}
          headingFont={headingFont}
          bodyFont={bodyFont}
          boxBgColor={boxBgColor}
          borderColor={borderColor}
        />
      ))}
    </div>
  )
}
