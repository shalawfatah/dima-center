// types/types.ts

import { carouselDictionary } from '@/utils/carousel_dictionary'
import { PcBuilderClientProps } from '@/utils/pc_build_items'

type Dictionary = (typeof carouselDictionary)['en']

export interface GeneralSettingsData {
  // === 🏢 COMPANY INFORMATION ===
  exchangeRate?: number
  slogan?: string
  logo?: any
  logoBackgroundColor?: string

  // === 🎨 SITE BACKGROUND ===
  siteBackground?: {
    backgroundColor?: string
  }

  // === 🎨 TYPOGRAPHY & FONTS ===
  typography?: {
    titleColor?: string
    bodyColor?: string
    boxBackgroundColor?: string
    boxBorderColor?: string
    kurdish?: {
      headingFont?: any
      bodyFont?: any
    }
    arabic?: {
      headingFont?: any
      bodyFont?: any
    }
    english?: {
      headingFont?: any
      bodyFont?: any
    }
  }

  // === 💻 PC BUILDER SETTINGS ===
  pcBuilder?: {
    backgroundImage?: any
    foregroundImage?: any
  }

  // === 🎨 HEADER & STYLING ===
  header?: {
    backgroundColor?: string
    eventLogoSticker?: any
  }

  // === 🧭 NAVBAR CONFIGURATION ===
  navbar?: {
    width?: 'full' | 'fit-content'
    backgroundColor?: string
    textColor?: string
  }

  // === 📞 CONTACT DETAILS ===
  email?: string
  phone?: string
  address?: string

  // === 🌐 SOCIAL MEDIA LINKS ===
  socials?: Array<{
    platform: string
    url: string
  }>

  // Allow any additional properties for flexibility
  [key: string]: any
}

// Keep your other interfaces as they are
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
  linkResolver?: (product: ProductItem) => string
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

export interface SlotLabels {
  clear?: string
  change?: string
  choose?: string
  noPart?: string
}

export interface ComponentSlotCardProps {
  slot: {
    key: string
    label: string
    categorySlug: string
    defaultImage?: string
  }
  chosenItem: {
    title?: string
    price?: number | string
    quantity?: number
    featuredImage?: {
      url?: string
    } | null
    [key: string]: any
  } | null
  t?: Record<string, string>
  currentLocale?: string
  labels?: SlotLabels
  getLocalizedTitle: (product: any) => string
  onOpen: (slotKey: string) => void
  onRemove: (slotKey: string) => void
  onQuantityChange: (slotKey: string, delta: number) => void
  titleColor?: string
  bodyColor?: string
  headingFont?: string
  bodyFont?: string
  boxBgColor?: string
  borderColor?: string
}

export interface ProductPriceDisplayProps {
  variant: 'detail' | 'card'
  finalPrice: number
  originalPrice: number
  isDiscounted: boolean
  iqdPrice: number
  currentLocale: string
  isRtl?: boolean
  headingFont?: string
  bodyFont?: string
  titleColor?: string
  bodyColor?: string
}

export interface ProductCardProps {
  product: ProductItem
  currentLocale: string
  cardWidth: number
  cardHeight: number
  productPath: string
  cardBgColor?: string
  t: Dictionary
  onQuickView: (product: ProductItem) => void
  onAddToCart: (e: React.MouseEvent, product: ProductItem) => void
  headingFont?: string
  bodyFont?: string
  titleColor?: string
  bodyColor?: string
  boxBorderColor?: string
}

export interface RelatedProductsProps {
  items?: any[]
  currentLocale: string
  isRtl: boolean
  exchangeRate: number
  cardBgColor?: string
  headingFont?: string
  bodyFont?: string
  dynamicFontFaceCSS?: string
  titleColor?: string
  bodyColor?: string
  borderColor?: string
}

export interface ProductPageProps {
  params: Promise<{
    locale: string
    category_slug: string
    id: string
  }>
}

export interface ProductInfoSidebarProps {
  product: any
  currentLocale: string
  isRtl: boolean
  finalPrice: number
  originalPrice: number
  isDiscounted: boolean
  iqdPrice: number
  cardBgColor?: string
  headingFont?: string
  bodyFont?: string
  dynamicFontFaceCSS?: string
  titleColor?: string
  bodyColor?: string
  boxTitleColor?: string
  boxBodyColor?: string
  boxPriceColor?: string
  borderColor?: string
}

export interface BuildSummarySidebarProps {
  t: Record<string, string>
  currentLocale: string
  mounted: boolean
  totalPrice: number
  totalOriginalPrice: number
  dynamicExchangeRate: number
  buyerNumber: string
  setBuyerNumber: (value: string) => void
  hasSelections: boolean
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
  fontFam: string
  titleColor?: string
  bodyColor?: string
  boxTitleColor?: string
  boxBodyColor?: string
  boxPriceColor?: string
  boxBgColor?: string
  borderColor?: string
}

export interface ExtendedPcBuilderClientProps extends PcBuilderClientProps {
  generals?: GeneralSettingsData
  headingFont?: string
  bodyFont?: string
  dynamicFontFaceCSS?: string
  titleColor?: string
  bodyColor?: string
  boxTitleColor?: string
  boxBodyColor?: string
  boxPriceColor?: string
  boxBgColor?: string
  boxBorderColor?: string
}

export interface ProductPickerModalProps {
  activeModalSlot: string
  products: any[]
  currentLocale: string
  labels: { modalSelectPrefix: string; noItems: string }
  selections: Record<string, any>
  getLocalizedTitle: (product: any) => string
  onSelect: (slotKey: string, product: any) => void
  onAddToCart: (product: any) => void
  onClose: () => void
  titleColor?: string
  bodyColor?: string
  boxTitleColor?: string
  boxBodyColor?: string
  boxPriceColor?: string
  headingFont?: string
  bodyFont?: string
  boxBgColor?: string
  borderColor?: string
}
