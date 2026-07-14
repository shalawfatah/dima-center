'use client'

import { useRouter } from 'next/navigation'

interface BringPartsButtonProps {
  components: { slotKey: string; productId: string }[]
  locale: string
}

export default function BringPartsButton({ components, locale }: BringPartsButtonProps) {
  const router = useRouter()

  const handleBringParts = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('🔍 DEBUG [Button Click]: Raw components array received by button:', components)

    if (!components || components.length === 0) {
      alert('❌ Debug Error: The components array passed to this button is completely empty!')
      return
    }

    // Filter out any items missing an ID to prevent broken query pairs like "cpu:undefined"
    const validComponents = components.filter((item) => item.slotKey && item.productId)

    if (validComponents.length === 0) {
      alert('❌ Debug Error: All components passed lacked a valid productId string!')
      return
    }

    const partsQuery = validComponents.map((item) => `${item.slotKey}:${item.productId}`).join(',')

    const targetUrl = `/${locale}/pc-builder?parts=${partsQuery}`

    console.log('🚀 DEBUG [Button Click]: Attempting hard browser routing to:', targetUrl)

    // FORCE A HARD REFRESH ROUTE: This guarantees middleware can't mask the query string on client-side state
    window.location.href = targetUrl
  }

  return (
    <button
      type="button"
      onClick={handleBringParts}
      className="btn-primary"
      style={{ cursor: 'pointer' }}
    >
      Bring parts to PC Builder
    </button>
  )
}
