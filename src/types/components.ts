import { ReactNode } from 'react'
import { StaticImageData } from 'next/image'

export interface SearchBarProps {
  searchQuery?: string
  setSearchQuery?: (query: string) => void
}

export interface StoreGridProps {
  searchQuery?: string
  selectedCategory?: string
}

export interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
}

export interface FoodCardProps {
  product: Product
  onAddToCart: (product: CartItem, quantity: number, selectedOption: { name: string }) => void
}

export interface CartBarProps {
  isOpen: boolean
  onClose: () => void
}

export interface AccountLayoutProps {
  children: ReactNode
}

export interface AccountSideBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export interface VendorLayoutProps {
  children: ReactNode
}

export interface VendorSideBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

// Status color mapping
export interface StatusColors {
  pending: string
  confirmed: string
  preparing: string
  ready: string
  delivered: string
  cancelled: string
}

export interface OrderStatus {
  [key: string]: string
}

// Re-export existing types with any additions
export interface Option {
  name: string
  price: number
}

export interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string | StaticImageData
  description: string
  rating: number
  cookTime: string
  options: Option[]
  ingredients: string[]
  dietary?: string[]
}

export interface CartItem {
  quantity: number
  id: string
  name: string
  price: number
  category: string
  image: string | StaticImageData
  description: string
  rating: number
  cookTime: string
  options: Option[]
  ingredients: string[]
  dietary?: string[]
  selectedOption: Option | null
}

export type AddToCart = (product: CartItem, quantity: number, selectedOption: { name: string }) => void | undefined

export interface Order {
  _id: string
  user: {
    name: string
    email: string
  }
  orderItems: Array<{
    product: string
    name: string
    price: number
    quantity: number
    selectedOption?: Option
  }>
  totalPrice: number
  status: string
  createdAt: string
  isPaid: boolean
  isDelivered: boolean
}