import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCartStore, Product } from '@/stores/cartStore'
import { apiClient, CartItemData } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { useAuth } from './useAuth'
import { useEffect } from 'react'

export function useCart() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const {
    items,
    cartCount,
    totalPrice,
    isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart: clearCartStore,
    setLoading,
    setError,
    setItems
  } = useCartStore()

  // Fetch cart from server for authenticated users
  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: () => apiClient.getCart(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1 minute
  })

  // Sync server cart with local store
  useEffect(() => {
    if (cartQuery.data?.data?.items) {
      setItems(cartQuery.data.data.items)
    }
  }, [cartQuery.data, setItems])

  // Add to cart mutation with optimistic updates
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity, selectedOptions }: CartItemData) => {
      if (isAuthenticated) {
        return apiClient.addToCart({ productId, quantity, selectedOptions })
      }
      // For guest users, we just update local state
      return Promise.resolve({ success: true })
    },
    onMutate: async ({ productId, quantity, selectedOptions }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      
      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(['cart'])
      
      // Optimistically update the cache
      if (isAuthenticated) {
        queryClient.setQueryData(['cart'], (old: any) => {
          if (!old?.data?.items) return old
          
          const existingItemIndex = old.data.items.findIndex((item: any) => 
            item.product._id === productId && 
            JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
          )
          
          if (existingItemIndex > -1) {
            // Update existing item
            const newItems = [...old.data.items]
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newItems[existingItemIndex].quantity + quantity
            }
            return { ...old, data: { ...old.data, items: newItems } }
          } else {
            // Add new item (simplified - in real app you'd need product data)
            return old
          }
        })
      }
      
      return { previousCart }
    },
    onSuccess: (data, variables) => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      }
      setError(null)
    },
    onError: (error: any, variables, context) => {
      // Rollback optimistic update
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart)
      }
      
      const errorMessage = error.message || 'Failed to add item to cart'
      showToast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (isAuthenticated) {
        return apiClient.removeFromCart(itemId)
      }
      return Promise.resolve({ success: true })
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      }
      showToast.success('Item removed from cart')
      setError(null)
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to remove item from cart'
      showToast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (isAuthenticated) {
        return apiClient.updateCartItem(itemId, quantity)
      }
      return Promise.resolve({ success: true })
    },
    onSuccess: () => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      }
      setError(null)
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update cart item')
    }
  })

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        return apiClient.clearCart()
      }
      return Promise.resolve({ success: true })
    },
    onSuccess: () => {
      clearCartStore()
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['cart'] })
      }
      showToast.success('Cart cleared successfully')
      setError(null)
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to clear cart'
      showToast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Wrapper functions that handle both local and server state
  const addToCart = async (
    product: Product, 
    quantity: number = 1, 
    selectedOption?: { name: string; price: number }[]
  ) => {
    // Update local state first for immediate UI feedback
    addItem(product, quantity, selectedOption)

    // If user is authenticated, sync with server
    if (isAuthenticated) {
      try {
        await addToCartMutation.mutateAsync({
          productId: product.id,
          quantity,
          selectedOptions: selectedOption as any
        })
        showToast.success(`${product.name} added to cart!`)
      } catch (error) {
        // If server update fails, revert local state
        removeItem(product.id, selectedOption?.[0]?.name)
        throw error
      }
    } else {
      // For guest users, show success message
      showToast.success(`${product.name} added to cart!`)
    }
  }

  const removeFromCart = async (productId: string, selectedOptionName?: string) => {
    // Update local state first
    removeItem(productId, selectedOptionName)

    // If user is authenticated, sync with server
    if (isAuthenticated) {
      try {
        await removeFromCartMutation.mutateAsync(productId)
      } catch (error) {
        // If server update fails, we'd need to revert, but this is complex
        // For now, we'll just show the error
        setError('Failed to sync with server')
      }
    }
  }

  const updateCartQuantity = async (
    productId: string, 
    newQuantity: number, 
    selectedOptionName?: string
  ) => {
    // Update local state first
    updateQuantity(productId, newQuantity, selectedOptionName)

    // If user is authenticated, sync with server
    if (isAuthenticated) {
      try {
        await updateCartMutation.mutateAsync({ itemId: productId, quantity: newQuantity })
      } catch (error) {
        setError('Failed to sync with server')
      }
    }
  }

  const clearCart = async () => {
    await clearCartMutation.mutateAsync()
  }

  // Sync cart when user logs in
  const syncCart = () => {
    if (isAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  }

  return {
    // State
    cartItems: items,
    cartCount,
    totalPrice,
    loading: isLoading || cartQuery.isLoading || addToCartMutation.isPending,
    error,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity: updateCartQuantity,
    clearCart,
    syncCart,
    
    // Mutation states
    addingToCart: addToCartMutation.isPending,
    removingFromCart: removeFromCartMutation.isPending,
    updatingCart: updateCartMutation.isPending,
    clearingCart: clearCartMutation.isPending
  }
}