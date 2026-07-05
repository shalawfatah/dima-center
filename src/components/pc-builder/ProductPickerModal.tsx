'use client'

import Image from 'next/image'
import Link from 'next/link'
import { COMPONENT_SLOTS } from '@/utils/pc_build_items'
import { getLocalizedTitle, getProductImageUrl } from './getLocalizedTitle'

interface ModalLabels {
  modalSelectPrefix: string
  noItems: string
}

interface ProductPickerModalProps {
  activeModalSlot: string
  products: any[]
  currentLocale: string
  labels: ModalLabels
  onSelect: (slotKey: string, product: any) => void
  onClose: () => void
  onQuickView?: (product: any) => void // Callback for Quick View implementation
  onAddToCart?: (product: any) => void // Callback for custom local storage cart mutation
}

export default function ProductPickerModal({
  activeModalSlot,
  products,
  currentLocale,
  labels,
  onSelect,
  onClose,
  onQuickView,
  onAddToCart,
}: ProductPickerModalProps) {
  const currentSlotConfig = COMPONENT_SLOTS.find((s) => s.key === activeModalSlot)
  if (!currentSlotConfig) return null

  const filteredProducts = products.filter((prod) => {
    const prodCategory = prod.category
    if (typeof prodCategory === 'object' && prodCategory !== null) {
      return prodCategory.slug === currentSlotConfig.categorySlug
    }
    return String(prodCategory).toLowerCase() === currentSlotConfig.categorySlug.toLowerCase()
  })

  // Safe direction formatting based on route parameters
  const isRtl = currentLocale === 'ar' || currentLocale === 'ckb'

  // Standard cart addition logic fallback if custom handler isn't provided globally
  const handleAddToCartDefault = (prod: any) => {
    try {
      const stored = localStorage.getItem('cart')
      const cart = stored ? JSON.parse(stored) : []
      const existing = cart.find((item: any) => item.id === prod.id)

      if (existing) {
        existing.quantity += 1
      } else {
        cart.push({
          id: prod.id,
          title: getLocalizedTitle(prod, currentLocale),
          price: prod.price,
          quantity: 1,
          imageUrl: getProductImageUrl(prod),
        })
      }
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))
      alert(
        currentLocale === 'ckb'
          ? 'زیادکرا بۆ سەبەتە!'
          : currentLocale === 'ar'
            ? 'تمت الإضافة للسلة!'
            : 'Added to cart!',
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="pc-builder-modal-overlay" onClick={onClose}>
      <div className="pc-builder-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="pc-builder-modal-header">
          <h3 className="pc-builder-modal-title">
            {labels.modalSelectPrefix} {currentSlotConfig.label}
          </h3>
          <button onClick={onClose} className="pc-builder-modal-close">
            &times;
          </button>
        </div>

        <div className="pc-builder-modal-body">
          {filteredProducts.length === 0 ? (
            <p className="pc-builder-modal-empty">
              {labels.noItems} "{currentSlotConfig.categorySlug}".
            </p>
          ) : (
            filteredProducts.map((prod) => {
              const modalProductImg = getProductImageUrl(prod)
              return (
                <div
                  key={prod.id}
                  onClick={() => onSelect(activeModalSlot, prod)}
                  className="pc-builder-product-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                  }}
                >
                  {/* Left Side: Thumbnail and Title Context */}
                  <div
                    className="pc-builder-product-info"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div className="pc-builder-product-thumb" style={{ flexShrink: 0 }}>
                      {modalProductImg ? (
                        <Image
                          src={modalProductImg}
                          height={100}
                          width={100}
                          alt={getLocalizedTitle(prod, currentLocale)}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Image
                          height={45}
                          width={45}
                          src={`/categories/${currentSlotConfig.key}.png`}
                          alt={currentSlotConfig.label}
                          className="object-contain opacity-50 w-4/5 h-4/5"
                        />
                      )}
                    </div>
                    <span
                      className="pc-builder-product-title"
                      style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {getLocalizedTitle(prod, currentLocale)}
                    </span>
                  </div>

                  {/* Right Side: Price + Inline Action Matrix Column */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      flexShrink: 0,
                      direction: 'ltr',
                    }}
                  >
                    <span className="pc-builder-product-price" style={{ fontWeight: '700' }}>
                      ${prod.price}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {/* 1. QUICK VIEW ACTION */}
                      <button
                        title="Quick View"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onQuickView) onQuickView(prod)
                          else alert(`Quick view layout context for: ${prod.id}`)
                        }}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#475569"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>

                      {/* 2. OPEN PRODUCT PAGE LINK */}
                      <Link
                        href={`/${currentLocale}/products/${prod.id || prod.slug}`}
                        title="Open Product Page"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: '#f1f5f9',
                          padding: '8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#475569"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </Link>

                      {/* 3. ADD TO SHOPPING CART BUTTON */}
                      <button
                        title="Add to Cart"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onAddToCart) onAddToCart(prod)
                          else handleAddToCartDefault(prod)
                        }}
                        style={{
                          background: '#0070f3',
                          border: 'none',
                          padding: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
