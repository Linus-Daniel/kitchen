import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  addresses?: Array<{
    _id: string
    label: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    type: 'home' | 'work' | 'other'
    isDefault: boolean
    createdAt: string
  }>
  role: 'user' | 'admin' | 'vendor'
  businessName?: string
  businessDescription?: string
  businessCategory?: string
  preferences?: {
    newsletter?: boolean
    smsNotifications?: boolean
    emailNotifications?: boolean
    orderUpdates?: boolean
    promotions?: boolean
  }
  isEmailVerified?: boolean
  createdAt?: string
  lastLogin?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateUser: (userData: Partial<User>) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        error: null,
        setUser: (user) => set({ user, error: null }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        updateUser: (userData) => {
          const currentUser = get().user
          if (currentUser) {
            set({ user: { ...currentUser, ...userData } })
          }
        },
        clearAuth: () => set({ user: null, error: null, isLoading: false })
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ user: state.user })
      }
    ),
    {
      name: 'auth-store'
    }
  )
)