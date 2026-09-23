'use client'

import React, { useEffect, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'
import Image from 'next/image'

export const FeaturedImagePreview: React.FC = () => {
  // Pulls the current selected media ID from the form state
  const featuredImageField = useFormFields(([fields]) => fields.featuredImage)
  const mediaId = featuredImageField?.value as string | undefined
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    // Defer all setState calls out of the synchronous effect body.
    // The `cancelled` flag prevents an outdated fetch from clobbering
    // the state of a newer mediaId (classic race when the user picks
    // media A, then quickly media B).
    let cancelled = false

    const load = async () => {
      if (!mediaId) {
        if (!cancelled) setImageUrl(null)
        return
      }

      try {
        const res = await fetch(`/api/media/${mediaId}`)
        if (!res.ok) throw new Error('Failed to fetch media details')
        const data = await res.json()
        if (!cancelled) setImageUrl(data?.url ?? null)
      } catch (err) {
        console.error('Error loading media preview:', err)
        if (!cancelled) setImageUrl(null)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [mediaId])

  if (!imageUrl) return null

  return (
    <div
      style={{
        position: 'relative', // required for fill
        marginTop: '12px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid var(--theme-elevation-150, #e2e8f0)',
        backgroundColor: 'var(--theme-elevation-50, #f8fafc)',
        padding: '8px',
        height: '180px', // give the wrapper an explicit height
      }}
    >
      <Image
        src={imageUrl}
        alt="Featured Preview"
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}
