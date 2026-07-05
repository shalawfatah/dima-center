'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocalStorageState } from '../../utils/pc_build_local_storage'
import { COMPONENT_SLOTS } from '@/utils/pc_build_items'

interface SaveMessage {
  type: '' | 'success' | 'error'
  text: string
}

export function useBuildSelections(user: any, currentLocale: string) {
  const router = useRouter()

  const [buildName, setBuildName] = useLocalStorageState<string>(
    'pc_build_name',
    'My Dream Rig Build',
  )
  const [selections, setSelections] = useLocalStorageState<Record<string, any>>(
    'pc_build_selections',
    {},
  )
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<SaveMessage>({ type: '', text: '' })

  const selectComponent = (slotKey: string, product: any) => {
    setSelections((prev) => ({
      ...prev,
      [slotKey]: product,
    }))
  }

  const removeComponent = (slotKey: string) => {
    setSelections((prev) => {
      const updated = { ...prev }
      delete updated[slotKey]
      return updated
    })
  }

  const totalPrice = Object.values(selections).reduce(
    (sum: number, item: any) => sum + (Number(item.price) || 0),
    0,
  )

  const handleSaveBuild = async () => {
    if (!user) return
    setIsSaving(true)
    setMessage({ type: '', text: '' })

    const componentsData: Record<string, string> = {}
    COMPONENT_SLOTS.forEach((slot) => {
      if (selections[slot.key]) {
        componentsData[slot.key] = selections[slot.key].id
      }
    })

    try {
      const res = await fetch('/api/pc-builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: buildName,
          user: user.id,
          totalPrice,
          components: componentsData,
        }),
      })

      if (res.ok) {
        window.localStorage.removeItem('pc_build_selections')
        window.localStorage.removeItem('pc_build_name')
        setMessage({ type: 'success', text: 'Rig blueprint layout secured successfully!' })
        router.push(`/${currentLocale}/account`)
      } else {
        setMessage({ type: 'error', text: 'Failed to preserve layout blueprint metrics.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected system networking error occurred.' })
    } finally {
      setIsSaving(false)
    }
  }

  return {
    buildName,
    setBuildName,
    selections,
    selectComponent,
    removeComponent,
    totalPrice,
    isSaving,
    message,
    handleSaveBuild,
  }
}
