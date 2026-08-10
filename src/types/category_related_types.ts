export interface PriceFilterProps {
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

export interface FilteredCategoryViewProps {
  currentLocale: string
  dirClass: string
  headingFont: string
  bodyFont: string
  dynamicFontFaceCSS: string
  matchedTitleEn: string | null
  matchedTitleAr: string | null
  matchedTitleCkb: string | null
  allProducts: any[]
  activeCategory: string
  boxBorderColor?: string
  boxBgColor?: string
  boxBodyColor?: string
  bodyColor?: string
  textColor?: string
}

export interface ExtendedPriceFilterProps extends PriceFilterProps {
  currentSort?: 'asc' | 'desc' | null
  onSortChange?: (sort: 'asc' | 'desc' | null) => void
}
