export interface CartItem {
  id: string
  title: string
  price: number // This will be the final executable price
  originalPrice?: number // Optional baseline price tracker for standard visual layout
  isDiscounted?: boolean
  categorySlug?: string
  isCustomBuild?: boolean
  buildName?: string
  components?: Record<string, string>
}

export type PaymentMethod = 'in_store' | 'cash_on_delivery'
