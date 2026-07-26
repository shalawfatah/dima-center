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

export interface FooterTranslations {
  aboutTitle: string
  aboutDesc: string
  contactTitle: string
  addressLine1: string
  addressLine2: string
  phonePrefix: string
  phoneValue: string
  policyTitle: string
  policyDesc: string
}

interface ModalLabels {
  modalSelectPrefix: string
  noItems: string
}

export interface ProductPickerModalProps {
  activeModalSlot: string
  products: any[]
  currentLocale: string
  labels: ModalLabels
  getLocalizedTitle: (product: any) => string
  onSelect: (slotKey: string, product: any) => void
  onAddToCart: (product: any) => void
  onClose: () => void
}

export interface ExtendedProductCarouselProps extends ProductCarouselProps {
  cardWidth?: number
  cardHeight?: number
}

export interface SearchPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; [key: string]: any }>
}

export interface ExternalCategory {
  _id: string
  name: string
}

export interface ExternalItem {
  _id: string
  name: string
  barcode?: string
  price: number
  currency: string
  websitePrice?: number
  websitePriceCurrency?: string
  quantity?: number
  category?: string
  brand?: string
  description?: string
}

export interface ExternalInventory {
  _id: string
  name: string
}

export interface ExternalStock {
  _id: string
  name: string
  code?: string
  barcode?: string
  totalQuantity: number
}

export interface CategoryItem {
  id?: string
  title: string
  slug?: string
  isContainer?: boolean
  subCategories?: Array<{
    title: string
    slug: string
  }>
}

export interface CategoryDropdownNavProps {
  currentLocale: string
  categories: CategoryItem[]
}
