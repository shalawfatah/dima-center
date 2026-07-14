// src/components/FeaturedImagePreview.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'

export const FeaturedImagePreview: React.FC = () => {
  // Pulls the current selected media ID from the form state
  const featuredImageField = useFormFields(([fields]) => fields.featuredImage)
  const mediaId = featuredImageField?.value as string | undefined
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!mediaId) {
      setImageUrl(null)
      return
    }

    // Fetch the media record from Payload's REST API to extract the real file URL
    fetch(`/api/media/${mediaId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch media details')
        return res.json()
      })
      .then((data) => {
        if (data && data.url) {
          setImageUrl(data.url)
        }
      })
      .catch((err) => {
        console.error('Error loading media preview:', err)
        setImageUrl(null)
      })
  }, [mediaId])

  if (!imageUrl) return null

  return (
    <div
      style={{
        marginTop: '12px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid var(--theme-elevation-150, #e2e8f0)',
        backgroundColor: 'var(--theme-elevation-50, #f8fafc)',
        padding: '8px',
      }}
    >
      <img
        src={imageUrl}
        alt="Featured Preview"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          maxHeight: '180px',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}
