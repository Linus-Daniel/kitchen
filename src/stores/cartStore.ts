import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StaticImageData } from 'next/image'

export type Option = {
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

export interface CartItem extends Product {
  quantity: number
  selectedOption?: { name: string; price: number }[]
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  // Computed values
  cartCount: number
  totalPrice: number
  // Actions
  addItem: (product: Product, quantity?: number, selectedOption?: { name: string; price: number }[]) => void
  removeItem: (productId: string, selectedOptionName?: string) => void
  updateQuantity: (productId: string, newQuantity: number, selectedOptionName?: string) => void
  clearCart: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setItems: (items: CartItem[]) => void
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isLoading: false,
        error: null,
        get cartCount() {
          return get().items.reduce((total, item) => total + item.quantity, 0)
        },
        get totalPrice() {
          return get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
        },
        addItem: (product, quantity = 1, selectedOption) => {
          set((state) => {
            const existingItemIndex = state.items.findIndex(
              item => item.id === product.id && 
                     JSON.stringify(item.selectedOption) === JSON.stringify(selectedOption)
            )

            if (existingItemIndex > -1) {
              // Update existing item quantity
              const updatedItems = [...state.items]
              updatedItems[existingItemIndex].quantity += quantity
              return { items: updatedItems, error: null }
            } else {
              // Add new item
              const newItem: CartItem = {
                ...product,
                quantity,
                selectedOption
              }
              return { items: [...state.items, newItem], error: null }
            }
          })
        },
        removeItem: (productId, selectedOptionName) => {
          set((state) => ({
            items: state.items.filter(
              item => !(item.id === productId && 
                       (!selectedOptionName || 
                        item.selectedOption?.some(opt => opt.name === selectedOptionName)))
            ),
            error: null
          }))
        },
        updateQuantity: (productId, newQuantity, selectedOptionName) => {
          if (newQuantity < 1) return

          set((state) => ({
            items: state.items.map(item =>
              item.id === productId && 
              (!selectedOptionName || 
               item.selectedOption?.some(opt => opt.name === selectedOptionName))
                ? { ...item, quantity: newQuantity }
                : item
            ),
            error: null
          }))
        },
        clearCart: () => set({ items: [], error: null }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setItems: (items) => set({ items, error: null })
      }),
      {
        name: 'cart-storage',
        partialize: (state) => ({ items: state.items })
      }
    ),
    {
      name: 'cart-store'
    }
  )
)