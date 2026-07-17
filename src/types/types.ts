export interface GeneralSettingsData {
  exchangeRate?: number
  slogan?: string
  logo?: any
  email?: string
  phone?: string
  address?: string
  socials?: Array<{ platform: string; url: string }>
}

export interface ProductItem {
  id: string
  title: string
  price: number | string
  priceIQD?: number | string | null
  condition?: string
  hasDiscount?: boolean
  discountType?: 'fixed' | 'percentage'
  discountValue?: number
  featuredImage?: {
    url: string
    alt?: string
  } | null
  isCaseOffer?: boolean
  href?: string
  [key: string]: any
}

export interface ProductCarouselProps {
  products: ProductItem[]
  currentLocale: string
  isRtl: boolean
  onAddToCart?: (product: ProductItem) => void
  linkResolver?: (product: ProductItem) => string // 👈 Parent routing injection point
}

export interface PCBuilderSectionProps {
  currentLocale: string
  isRtl: boolean
}

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface CartClientComponentProps {
  currentLocale: string
}

export interface OrderButtonProps {
  product: {
    title: string
    price: string
    url: string
  }
  currentLocale: string
}

export interface RelatedProductCardProps {
  item: any
  currentLocale: string
  isRtl: boolean
  exchangeRate: number
}
