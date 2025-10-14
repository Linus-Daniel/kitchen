import { ReactNode } from 'react'
import { User, Vendor, LoginCredentials, RegisterData, VendorRegisterData } from './auth'
import { CartItem, Option } from './components'

export interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: CartItem, quantity: number, selectedOption: Option | null) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
}

export interface AuthProviderProps {
  children: ReactNode
}

export interface VendorAuthProviderProps {
  children: ReactNode
}

export interface CartProviderProps {
  children: ReactNode
}