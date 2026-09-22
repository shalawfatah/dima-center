'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'

interface FilterSidebarProps {
  locale: string
  facets: {
    conditions: string[]
    minPrice: number
    maxPrice: number
    dynamicSpecs: Record<string, string[]>
  }
}

export default function FilterSidebar({ locale, facets }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // ─── Derived directly from the URL (single source of truth) ───────────
  const selectedConditions = useMemo(
    () => searchParams.get('condition')?.split(',').filter(Boolean) ?? [],
    [searchParams],
  )

  const sortBy = searchParams.get('sort') || 'price_asc'

  const activeSpecs = useMemo(() => {
    const specs: Record<string, string[]> = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith('spec_')) {
        specs[key.replace('spec_', '')] = value.split(',').filter(Boolean)
      }
    })
    return specs
  }, [searchParams])

  // ─── Draft state for the price slider only (commit-on-release) ────────
  const urlPrice = Number(searchParams.get('maxPrice')) || facets.maxPrice
  const [draftPrice, setDraftPrice] = useState<number>(urlPrice)
  const [lastUrlPrice, setLastUrlPrice] = useState<number>(urlPrice)

  // Sync draft when the URL changes externally (browser back/forward, etc.).
  // This is the "adjust state during render" pattern from the React docs —
  // it avoids an effect and does not cause an extra render pass.
  if (lastUrlPrice !== urlPrice) {
    setLastUrlPrice(urlPrice)
    setDraftPrice(urlPrice)
  }

  const priceRange = draftPrice

  // ─── Helpers ──────────────────────────────────────────────────────────
  const updateFilters = (
    nextConditions: string[],
    nextPrice: number,
    nextSort: string,
    nextSpecs: Record<string, string[]>,
  ) => {
    const params = new URLSearchParams(searchParams.toString())

    if (nextConditions.length > 0) params.set('condition', nextConditions.join(','))
    else params.delete('condition')

    params.set('maxPrice', nextPrice.toString())
    params.set('sort', nextSort)

    searchParams.forEach((_, key) => {
      if (key.startsWith('spec_')) params.delete(key)
    })
    Object.keys(nextSpecs).forEach((key) => {
      if (nextSpecs[key].length > 0) {
        params.set(`spec_${key}`, nextSpecs[key].join(','))
      }
    })

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const toggleCondition = (cond: string) => {
    const updated = selectedConditions.includes(cond)
      ? selectedConditions.filter((c) => c !== cond)
      : [...selectedConditions, cond]
    updateFilters(updated, priceRange, sortBy, activeSpecs)
  }

  const toggleSpec = (specKey: string, val: string) => {
    const currentVals = activeSpecs[specKey] || []
    const updatedVals = currentVals.includes(val)
      ? currentVals.filter((v) => v !== val)
      : [...currentVals, val]

    const updatedSpecs = { ...activeSpecs, [specKey]: updatedVals }
    if (updatedVals.length === 0) delete updatedSpecs[specKey]

    updateFilters(selectedConditions, priceRange, sortBy, updatedSpecs)
  }

  // 🎯 Dictionary scoped to its own definition block to avoid circular refs
  const translationsDictionary = {
    en: {
      title: 'Filters',
      sort: 'Sort By',
      price: 'Max Price',
      cond: 'Condition',
      lowHigh: 'Price: Low to High',
      highLow: 'Price: High to Low',
    },
    ar: {
      title: 'الفلاتر',
      sort: 'ترتيب حسب',
      price: 'السعر الأعلى',
      cond: 'الحالة',
      lowHigh: 'السعر: من الأقل للأعلى',
      highLow: 'السعر: من الأعلى للأقل',
    },
    ckb: {
      title: 'فلتەرەکان',
      sort: 'ڕێکخستن بەپێی',
      price: 'بەرزترین نرخ',
      cond: 'دۆخی کاڵا',
      lowHigh: 'نرخ: کەم بۆ زۆر',
      highLow: 'نرخ: زۆر بۆ کەم',
    },
  }

  const translations =
    translationsDictionary[locale as keyof typeof translationsDictionary] ||
    translationsDictionary.en

  return (
    <aside
      style={{
        width: '100%',
        padding: '1.5rem',
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #eef0f2',
        opacity: isPending ? 0.6 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      <h2
        style={{
          fontFamily: '"Rudaw", sans-serif' /* 🌟 Headlines take Rudaw */,
          fontSize: '1.2rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #f8fafc',
          paddingBottom: '0.5rem',
          color: '#1e293b',
        }}
      >
        {translations.title}
      </h2>

      {/* 1. SORT CRITERIA */}
      <div style={{ marginBottom: '1.75rem' }}>
        <label
          style={{
            fontFamily: '"Sarchia", sans-serif' /* 🌟 Body UI fields take Sarchia */,
            display: 'block',
            fontSize: '12px',
            fontWeight: '700',
            color: '#475569',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}
        >
          {translations.sort}
        </label>
        <select
          value={sortBy}
          onChange={(e) =>
            updateFilters(selectedConditions, priceRange, e.target.value, activeSpecs)
          }
          style={{
            fontFamily: '"Sarchia", sans-serif',
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '14px',
            backgroundColor: '#fff',
            color: '#1e293b',
          }}
        >
          <option value="price_asc">{translations.lowHigh}</option>
          <option value="price_desc">{translations.highLow}</option>
        </select>
      </div>

      {/* 2. PRICE RANGE SLIDER */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div
          style={{
            fontFamily: '"Sarchia", sans-serif',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            fontWeight: '700',
            color: '#475569',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}
        >
          <span>{translations.price}</span>
          <span style={{ color: '#0070f3', fontWeight: '800' }}>${priceRange}</span>
        </div>
        <input
          type="range"
          min={facets.minPrice}
          max={facets.maxPrice || 2000}
          value={draftPrice}
          onChange={(e) => setDraftPrice(Number(e.target.value))}
          onMouseUp={() => updateFilters(selectedConditions, draftPrice, sortBy, activeSpecs)}
          style={{ width: '100%', accentColor: '#0070f3', cursor: 'pointer' }}
        />
        <div
          style={{
            fontFamily: '"Sarchia", sans-serif',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#94a3b8',
            marginTop: '0.25rem',
          }}
        >
          <span>${facets.minPrice}</span>
          <span>${facets.maxPrice}</span>
        </div>
      </div>

      {/* 3. HARDWARE CONDITION MATCHING */}
      {facets.conditions.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <span
            style={{
              fontFamily: '"Sarchia", sans-serif',
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: '#475569',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            {translations.cond}
          </span>
          {facets.conditions.map((cond) => (
            <label
              key={cond}
              style={{
                fontFamily: '"Sarchia", sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '14px',
                margin: '0.5rem 0',
                cursor: 'pointer',
                textTransform: 'capitalize',
                color: '#1e293b',
              }}
            >
              <input
                type="checkbox"
                checked={selectedConditions.includes(cond)}
                onChange={() => toggleCondition(cond)}
                style={{ width: '16px', height: '16px', accentColor: '#0070f3' }}
              />
              {cond.toLowerCase().replace('_', ' ')}
            </label>
          ))}
        </div>
      )}

      {/* 4. DYNAMIC TECHNICAL SPECIFICATION INTERFACES */}
      {Object.keys(facets.dynamicSpecs).map((specKey) => (
        <div
          key={specKey}
          style={{ marginBottom: '1.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}
        >
          <span
            style={{
              fontFamily: '"Sarchia", sans-serif',
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: '#475569',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
            }}
          >
            {specKey}
          </span>
          {facets.dynamicSpecs[specKey].map((val) => {
            const isChecked = (activeSpecs[specKey] || []).includes(val)
            return (
              <label
                key={val}
                style={{
                  fontFamily: '"Sarchia", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '14px',
                  margin: '0.5rem 0',
                  cursor: 'pointer',
                  color: '#1e293b',
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSpec(specKey, val)}
                  style={{ width: '16px', height: '16px', accentColor: '#0070f3' }}
                />
                {val}
              </label>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
