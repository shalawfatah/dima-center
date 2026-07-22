import { getDiscountedPrice } from './pc_builder_pricing'
import { cartErrorMessage, cartSuccessMessage, pickLocale } from './pc_builder_translations'

export interface CartActionResult {
  type: 'success' | 'error'
  text: string
}

/**
 * Adds (or bumps the quantity of) a product in the localStorage cart and
 * notifies the rest of the app via a `cart-updated` event.
 * Returns a status message the caller can surface to the user.
 */
export function addProductToCart(
  product: any,
  currentLocale: string,
  getLocalizedTitle: (product: any) => string,
): CartActionResult {
  try {
    const stored = localStorage.getItem('cart')
    const cart = stored ? JSON.parse(stored) : []
    const existing = cart.find((item: any) => item.id === product.id)
    const imageUrl = product?.featuredImage?.url || product?.meta?.image?.url
    const finalPrice = getDiscountedPrice(product)

    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({
        id: product.id,
        title: getLocalizedTitle(product),
        price: finalPrice,
        quantity: 1,
        imageUrl,
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))

    return { type: 'success', text: pickLocale(cartSuccessMessage, currentLocale) }
  } catch (err) {
    console.error(err)
    return { type: 'error', text: cartErrorMessage }
  }
}
