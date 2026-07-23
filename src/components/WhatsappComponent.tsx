'use client'

import React, { useState } from 'react'
import { WhatsappBtn } from './WhatsappBtn'
import { WhatsappWindow } from './WhatsappWindow'

interface WhatsappComponentProps {
  phoneNumber?: string
  businessName?: string
}

export const WhatsappComponent: React.FC<WhatsappComponentProps> = ({
  phoneNumber = '9647701414269', // Replace with default business number
  businessName = 'Support Team',
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      {isOpen && (
        <WhatsappWindow
          phoneNumber={phoneNumber}
          businessName={businessName}
          onClose={() => setIsOpen(false)}
        />
      )}
      <WhatsappBtn isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
    </div>
  )
}
