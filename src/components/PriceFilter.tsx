'use client'

import React, { useState } from 'react'

interface PriceFilterProps {
  minPrice?: number
  maxPrice?: number
  defaultMin?: number
  defaultMax?: number
  currencySymbol?: string
  currentLocale?: string
  cardBgColor?: string
  borderColor?: string
  boxBodyColor?: string
  bodyColor?: string
  textColor?: string
  onFilterChange: (min: number, max: number) => void
}

export default function PriceFilter({
  minPrice = 0,
  maxPrice = 7000,
  defaultMin = 0,
  defaultMax = 7000,
  currencySymbol = '$',
  currentLocale = 'en',
  cardBgColor,
  borderColor,
  boxBodyColor,
  bodyColor,
  textColor,
  onFilterChange,
}: PriceFilterProps) {
  const [currentMin, setCurrentMin] = useState<number>(defaultMin)
  const [currentMax, setCurrentMax] = useState<number>(defaultMax)

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), currentMax - 50)
    setCurrentMin(value)
    onFilterChange(value, currentMax)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), currentMin + 50)
    setCurrentMax(value)
    onFilterChange(currentMin, value)
  }

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const resolvedBg = cardBgColor || '#ffffff'
  const resolvedBorder = borderColor || '#e2e8f0'
  const resolvedTextColor = boxBodyColor || bodyColor || textColor || '#0f172a'

  // Calculate track fill percentages for the dual slider appearance
  const minPercent = ((currentMin - minPrice) / (maxPrice - minPrice)) * 100
  const maxPercent = ((currentMax - minPrice) / (maxPrice - minPrice)) * 100

  return (
    <div
      style={{
        width: '100%',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        border: `1px solid ${resolvedBorder}`,
        backgroundColor: resolvedBg,
        boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
        marginBottom: '2rem',
        direction: isRtl ? 'rtl' : 'ltr',
        color: resolvedTextColor,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'inherit',
            fontFamily: 'inherit',
          }}
        >
          {currentLocale === 'ar'
            ? 'تصفية حسب السعر'
            : currentLocale === 'ckb'
              ? 'پاڵاوتن بە نرخ'
              : 'Filter by Price'}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'inherit',
            fontFamily: 'inherit',
          }}
        >
          {currencySymbol}
          {currentMin.toLocaleString()} – {currencySymbol}
          {currentMax.toLocaleString()}
        </span>
      </div>

      <div style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .dual-range-input {
            position: absolute;
            width: 100%;
            height: 6px;
            background: none;
            pointer-events: none;
            -webkit-appearance: none;
            appearance: none;
            margin: 0;
          }
          .dual-range-input::-webkit-slider-thumb {
            pointer-events: auto;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            -webkit-appearance: none;
            appearance: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 2px solid #ffffff;
            transition: transform 0.1s ease;
          }
          .dual-range-input::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          .dual-range-input::-moz-range-thumb {
            pointer-events: auto;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 2px solid #ffffff;
          }
        `,
          }}
        />

        {/* Background Track */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '6px',
            backgroundColor: resolvedBorder,
            borderRadius: '3px',
            zIndex: 0,
          }}
        />

        {/* Highlighted Active Range Track */}
        <div
          style={{
            position: 'absolute',
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
            height: '6px',
            backgroundColor: '#2563eb',
            borderRadius: '3px',
            zIndex: 1,
          }}
        />

        {/* Min Range Input */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={50}
          value={currentMin}
          onChange={handleMinChange}
          className="dual-range-input"
          style={{ zIndex: currentMin > maxPrice - 500 ? 3 : 2 }}
        />

        {/* Max Range Input */}
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          step={50}
          value={currentMax}
          onChange={handleMaxChange}
          className="dual-range-input"
          style={{ zIndex: 3 }}
        />
      </div>
    </div>
  )
}
