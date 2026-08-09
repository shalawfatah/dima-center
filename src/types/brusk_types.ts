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
