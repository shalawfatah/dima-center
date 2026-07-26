'use client'

import React from 'react'
import { WhatsappBtn } from './WhatsappBtn'

interface WhatsappComponentProps {
  phoneNumber?: string
  businessName?: string
}

export const WhatsappComponent: React.FC<WhatsappComponentProps> = ({
  phoneNumber = '9647701414269',
}) => {
  const handleClick = () => {
    // Strip out non-numeric characters (+, spaces, dashes)
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${cleanNumber}`

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return <WhatsappBtn onClick={handleClick} />
}
