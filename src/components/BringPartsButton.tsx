'use client'

import { useRouter } from 'next/navigation'

interface BringPartsButtonProps {
  // Let's assume you pass the pre-selected parts as an array or object
  components: { slotKey: string; productId: string }[]
  locale: string
}

export default function BringPartsButton({ components, locale }: BringPartsButtonProps) {
  const router = useRouter()

  const handleBringParts = () => {
    // 1. Map the parts array to 'slotKey:productId' format
    // Example output: "cpu:id123,gpu:id456,ram:id789"
    const partsQuery = components.map((item) => `${item.slotKey}:${item.productId}`).join(',')

    // 2. Redirect the user directly to your newly updated PcBuilder client page
    router.push(`/${locale}/pc-builder?parts=${partsQuery}`)
  }

  return (
    <button onClick={handleBringParts} className="btn-primary">
      Bring parts to PC Builder
    </button>
  )
}
