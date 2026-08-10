'use client'

import { ExtendedPriceFilterProps } from '@/types/category_related_types'
import { translations } from '@/utils/price_filter_translations'
import React, { useState } from 'react'

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
  currentSort = null,
  onSortChange,
}: ExtendedPriceFilterProps) {
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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'asc' | 'desc' | ''
    const nextSort = value === '' ? null : value
    if (onSortChange) {
      onSortChange(nextSort)
    }
  }

  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'
  const resolvedBg = cardBgColor || '#ffffff'
  const resolvedBorder = borderColor || '#e2e8f0'
  const resolvedTextColor = boxBodyColor || bodyColor || textColor || '#0f172a'

  // Calculate track fill percentages for the dual slider appearance
  const minPercent = ((currentMin - minPrice) / (maxPrice - minPrice)) * 100
  const maxPercent = ((currentMax - minPrice) / (maxPrice - minPrice)) * 100

  const t = translations[currentLocale as keyof typeof translations] || translations.en

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
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .price-filter-wrapper {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            width: 100%;
          }

          .price-slider-section {
            flex: 2;
            min-width: 0;
          }

          .price-sort-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border-inline-start: 1px solid ${resolvedBorder};
            padding-inline-start: 1.5rem;
          }

          .sort-select-dropdown {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid ${resolvedBorder};
            background-color: transparent;
            color: inherit;
            outline: none;
            transition: border-color 0.2s ease;
          }

          .sort-select-dropdown:hover,
          .sort-select-dropdown:focus {
            border-color: #2563eb;
          }

          /* Dual Range Input Styling */
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

          @media (max-width: 768px) {
            .price-filter-wrapper {
              flex-direction: column;
              align-items: stretch;
              gap: 1.25rem;
            }

            .price-slider-section,
            .price-sort-section {
              flex: none;
              width: 100%;
            }

            .price-sort-section {
              padding-inline-start: 0;
              border-inline-start: none;
              border-top: 1px solid ${resolvedBorder};
              padding-top: 1rem;
            }
          }
        `,
        }}
      />

      <div className="price-filter-wrapper">
        <div className="price-slider-section">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'inherit' }}>
              {t.filterTitle}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'inherit' }}>
              {currencySymbol}
              {currentMin.toLocaleString()} – {currencySymbol}
              {currentMax.toLocaleString()}
            </span>
          </div>

          <div
            style={{ position: 'relative', height: '24px', display: 'flex', alignItems: 'center' }}
          >
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

        <div className="price-sort-section">
          <span
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'inherit',
              marginBottom: '0.5rem',
            }}
          >
            {t.sortTitle}
          </span>
          <select
            value={currentSort || ''}
            onChange={handleSortChange}
            className="sort-select-dropdown"
          >
            <option value="" style={{ color: '#000' }}>
              {currentLocale === 'ar' ? 'افتراضي' : currentLocale === 'ckb' ? 'ئاسایی' : 'Default'}
            </option>
            <option value="asc" style={{ color: '#000' }}>
              {t.lowToHigh}
            </option>
            <option value="desc" style={{ color: '#000' }}>
              {t.highToLow}
            </option>
          </select>
        </div>
      </div>
    </div>
  )
}
