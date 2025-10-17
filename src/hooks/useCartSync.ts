'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/stores/cartStore'

/**
 * Hook to automatically sync cart with server when user logs in/out
 */
export function useCartSync() {
  const { data: session, status } = useSession()
  const { loadCart, clearCart } = useCartStore()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (session?.user) {
      // User is logged in - load cart from server
      loadCart()
    } else {
      // User is logged out - clear local cart
      // Note: Don't call API clearCart here as user is not authenticated
      useCartStore.setState({ items: [], error: null })
    }
  }, [session, status, loadCart])

  return {
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading'
  }
}