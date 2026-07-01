'use client'

import { useCart } from '@/components/cart/CartContext'

interface ProductBuyActionsProps {
  product: any
  finalPrice: number
  originalPrice: number
  isDiscounted: boolean
  currentLocale: string
}

export default function ProductBuyActions({
  product,
  finalPrice,
  originalPrice,
  isDiscounted,
  currentLocale,
}: ProductBuyActionsProps) {
  const { openCheckout } = useCart()

  return (
    <button
      type="button"
      disabled={product.stock <= 0}
      onClick={() =>
        openCheckout({
          id: product.id,
          title: product.title,
          price: finalPrice, // Using the clean props passed from server
          originalPrice: originalPrice,
          isDiscounted: isDiscounted,
        })
      }
      style={{
        width: '100%',
        background: product.stock > 0 ? '#0070f3' : '#ccc',
        color: '#fff',
        border: 'none',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
        marginTop: '1rem',
        fontFamily: 'Rudaw',
      }}
    >
      {currentLocale === 'ar'
        ? 'إضافة إلى السلة'
        : currentLocale === 'ckb'
          ? 'بخەرە سەبەتەوە'
          : 'Add to Cart'}
    </button>
  )
}
