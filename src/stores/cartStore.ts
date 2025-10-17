import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StaticImageData } from 'next/image'
import apiClient, { CartItemData } from '@/lib/api'
import { showToast } from '@/lib/toast'

// Analytics integration
interface AnalyticsEvent {
  event: string
  data: any
  timestamp: number
}

// Performance monitoring
interface PerformanceTracker {
  startTimer: (operation: string) => number
  endTimer: (startTime: number, operation: string) => void
}

// Offline operation queue
interface QueuedOperation {
  id: string
  type: 'add' | 'update' | 'remove' | 'clear'
  data: any
  timestamp: number
  retries: number
}

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
  productId: string
  quantity: number
  selectedOption?: { name: string; price: number }[]
}

interface CartState {
  // Core state
  items: CartItem[]
  isLoading: boolean
  error: string | null
  
  // Enhanced state management
  lastSynced: Date | null
  isDirty: boolean // Has local changes not synced
  version: number // For conflict resolution
  isOnline: boolean
  
  // Loading states
  loadingStates: {
    [itemId: string]: 'adding' | 'updating' | 'removing' | null
  }
  globalLoading: boolean
  
  // Offline support
  operationQueue: QueuedOperation[]
  isProcessingQueue: boolean
  
  // Computed values
  cartCount: number
  totalPrice: number
  
  // Core Actions
  addItem: (product: Product, quantity?: number, selectedOption?: { name: string; price: number }[]) => Promise<void>
  removeItem: (productId: string, selectedOptionName?: string) => Promise<void>
  updateQuantity: (productId: string, newQuantity: number, selectedOptionName?: string) => Promise<void>
  clearCart: () => Promise<void>
  loadCart: () => Promise<void>
  
  // Enhanced Actions
  validateCart: () => Promise<{ isValid: boolean; issues: string[] }>
  updateMultipleItems: (updates: Array<{id: string, quantity: number}>) => Promise<void>
  syncWithServer: () => Promise<void>
  processOfflineQueue: () => Promise<void>
  
  // Utility Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setItems: (items: CartItem[]) => void
  setItemLoading: (itemId: string, state: 'adding' | 'updating' | 'removing' | null) => void
  setOnlineStatus: (isOnline: boolean) => void
  markDirty: () => void
  markClean: () => void
}

// Utility Functions
const performanceTracker: PerformanceTracker = {
  startTimer: (operation: string) => {
    const startTime = performance.now()
    console.log(`🚀 Starting cart operation: ${operation}`)
    return startTime
  },
  endTimer: (startTime: number, operation: string) => {
    const duration = performance.now() - startTime
    console.log(`✅ Cart ${operation} completed in ${duration.toFixed(2)}ms`)
    
    // Track slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow cart operation detected: ${operation} took ${duration.toFixed(2)}ms`)
    }
  }
}

// Analytics tracker
const analytics = {
  track: (event: string, data: any) => {
    const analyticsEvent: AnalyticsEvent = {
      event: `cart_${event}`,
      data,
      timestamp: Date.now()
    }
    
    // Send to analytics service (replace with your analytics provider)
    console.log('📊 Analytics:', analyticsEvent)
    
    // Example: Send to Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', analyticsEvent.event, {
        custom_parameter: JSON.stringify(analyticsEvent.data)
      })
    }
  }
}

// Cart validation
const validateCartItem = (item: CartItem): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!item.id) errors.push('Item ID is required')
  if (item.quantity <= 0) errors.push('Quantity must be greater than 0')
  if (item.quantity > 100) errors.push('Quantity cannot exceed 100')
  if (item.price < 0) errors.push('Price cannot be negative')
  if (!item.name || item.name.trim() === '') errors.push('Item name is required')
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Retry logic with exponential backoff
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries - 1) {
        console.error(`❌ Operation failed after ${maxRetries} attempts:`, lastError)
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      console.warn(`⚠️ Operation failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// Cart backup utilities
const cartBackup = {
  save: (items: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart-backup', JSON.stringify({
        items,
        timestamp: Date.now()
      }))
    }
  },
  restore: (): { items: CartItem[]; timestamp: number } | null => {
    if (typeof window !== 'undefined') {
      const backup = localStorage.getItem('cart-backup')
      if (backup) {
        try {
          return JSON.parse(backup)
        } catch (error) {
          console.error('Failed to restore cart backup:', error)
        }
      }
    }
    return null
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart-backup')
    }
  }
}

// Item key generator for deduplication
const getItemKey = (item: CartItem | Product, selectedOption?: { name: string; price: number }[]) => {
  const options = selectedOption || (item as CartItem).selectedOption || []
  const sortedOptions = options.sort((a, b) => a.name.localeCompare(b.name))
  return `${item.id}-${JSON.stringify(sortedOptions)}`
}

// Generate unique operation ID
const generateOperationId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Helper function to recalculate computed values
const recalculateCartTotals = (items: CartItem[]) => ({
  cartCount: items.reduce((total, item) => total + item.quantity, 0),
  totalPrice: items.reduce((total, item) => total + (item.price * item.quantity), 0)
})

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        // Core state
        items: [],
        isLoading: false,
        error: null,
        
        // Enhanced state
        lastSynced: null,
        isDirty: false,
        version: 0,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        
        // Loading states
        loadingStates: {},
        globalLoading: false,
        
        // Offline support
        operationQueue: [],
        isProcessingQueue: false,
        
        // Computed values - these will be calculated whenever accessed
        cartCount: 0,
        totalPrice: 0,
        addItem: async (product, quantity = 1, selectedOption) => {
          const startTime = performanceTracker.startTimer('addItem')
          const itemKey = getItemKey(product, selectedOption)
          
          try {
            // Validate item
            const tempItem: CartItem = {
              ...product,
              productId: product.id,
              quantity,
              selectedOption
            }
            
            const validation = validateCartItem(tempItem)
            if (!validation.isValid) {
              throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
            }
            
            set({ globalLoading: true, error: null })
            get().setItemLoading(product.id, 'adding')
            
            // Check if item already exists
            const existingItemIndex = get().items.findIndex(
              item => getItemKey(item) === itemKey
            )

            if (existingItemIndex > -1) {
              // Update existing item quantity
              const existingItem = get().items[existingItemIndex]
              const newQuantity = existingItem.quantity + quantity
              await get().updateQuantity(product.id, newQuantity)
              return
            }

            // Optimistic update
            const newItems = [...get().items, tempItem]
            set((state) => ({ 
              items: newItems,
              isDirty: true,
              ...recalculateCartTotals(newItems)
            }))

            // Prepare API payload
            const cartItemData: CartItemData = {
              productId: product.id,
              quantity,
              selectedOptions: selectedOption?.map(opt => ({ name: opt.name, choice: opt.name }))
            }

            if (get().isOnline) {
              // Online: Make API call with retry
              await retryOperation(async () => {
                const response = await apiClient.addToCart(cartItemData)
                if (!response.success) {
                  throw new Error(response.error || 'Failed to add item to cart')
                }
                return response
              })
              
              set({ 
                lastSynced: new Date(),
                isDirty: false,
                version: get().version + 1
              })
              showToast.success('Item added to cart!')
              analytics.track('item_added', { productId: product.id, quantity, hasOptions: !!selectedOption })
            } else {
              // Offline: Queue operation
              const operation: QueuedOperation = {
                id: generateOperationId(),
                type: 'add',
                data: { product, quantity, selectedOption },
                timestamp: Date.now(),
                retries: 0
              }
              
              set((state) => ({
                operationQueue: [...state.operationQueue, operation]
              }))
              
              showToast.info('Added to cart (will sync when online)')
            }
            
            // Save backup
            cartBackup.save(get().items)
            
          } catch (error: any) {
            // Rollback optimistic update
            const rollbackItems = get().items.filter(item => getItemKey(item) !== itemKey)
            set((state) => ({
              items: rollbackItems,
              error: error.message || 'Failed to add item to cart',
              isDirty: false,
              ...recalculateCartTotals(rollbackItems)
            }))
            
            showToast.error(error.message || 'Failed to add item to cart')
            analytics.track('item_add_failed', { productId: product.id, error: error.message })
          } finally {
            set({ globalLoading: false })
            get().setItemLoading(product.id, null)
            performanceTracker.endTimer(startTime, 'addItem')
          }
        },
        removeItem: async (productId, selectedOptionName) => {
          const startTime = performanceTracker.startTimer('removeItem')
          
          try {
            set({ globalLoading: true, error: null })
            get().setItemLoading(productId, 'removing')
            
            // Find the item to remove
            const itemToRemove = get().items.find(
              item => item.id === productId && 
                     (!selectedOptionName || 
                      item.selectedOption?.some(opt => opt.name === selectedOptionName))
            )
            
            if (!itemToRemove) {
              throw new Error('Item not found in cart')
            }

            const itemKey = getItemKey(itemToRemove)
            
            // Optimistic update
            const originalItems = get().items
            const newItems = originalItems.filter(item => getItemKey(item) !== itemKey)
            set(() => ({
              items: newItems,
              isDirty: true,
              ...recalculateCartTotals(newItems)
            }))

            if (get().isOnline) {
              // Online: Make API call with retry
              await retryOperation(async () => {
                const response = await apiClient.removeFromCart(productId)
                if (!response.success) {
                  throw new Error(response.error || 'Failed to remove item from cart')
                }
                return response
              })
              
              set({ 
                lastSynced: new Date(),
                isDirty: false,
                version: get().version + 1
              })
              showToast.success('Item removed from cart')
              analytics.track('item_removed', { productId })
            } else {
              // Offline: Queue operation
              const operation: QueuedOperation = {
                id: generateOperationId(),
                type: 'remove',
                data: { productId, selectedOptionName },
                timestamp: Date.now(),
                retries: 0
              }
              
              set((state) => ({
                operationQueue: [...state.operationQueue, operation]
              }))
              
              showToast.info('Removed from cart (will sync when online)')
            }
            
            cartBackup.save(get().items)
            
          } catch (error: any) {
            // Rollback optimistic update
            const itemToRemove = get().items.find(
              item => item.id === productId && 
                     (!selectedOptionName || 
                      item.selectedOption?.some(opt => opt.name === selectedOptionName))
            )
            
            if (itemToRemove) {
              const rollbackItems = [...get().items, itemToRemove]
              set((state) => ({
                items: rollbackItems,
                error: error.message || 'Failed to remove item from cart',
                isDirty: false,
                ...recalculateCartTotals(rollbackItems)
              }))
            }
            
            showToast.error(error.message || 'Failed to remove item from cart')
            analytics.track('item_remove_failed', { productId, error: error.message })
          } finally {
            set({ globalLoading: false })
            get().setItemLoading(productId, null)
            performanceTracker.endTimer(startTime, 'removeItem')
          }
        },
        updateQuantity: async (productId, newQuantity, selectedOptionName) => {
          if (newQuantity < 1) {
            await get().removeItem(productId, selectedOptionName)
            return
          }

          const startTime = performanceTracker.startTimer('updateQuantity')
          
          try {
            set({ globalLoading: true, error: null })
            get().setItemLoading(productId, 'updating')
            
            // Find the item to update
            const itemToUpdate = get().items.find(
              item => item.id === productId && 
                     (!selectedOptionName || 
                      item.selectedOption?.some(opt => opt.name === selectedOptionName))
            )
            
            if (!itemToUpdate) {
              throw new Error('Item not found in cart')
            }

            // Validate new quantity
            if (newQuantity > 100) {
              throw new Error('Quantity cannot exceed 100')
            }

            const originalQuantity = itemToUpdate.quantity
            
            // Optimistic update
            const newItems = get().items.map(item =>
              item.id === productId && 
              (!selectedOptionName || 
               item.selectedOption?.some(opt => opt.name === selectedOptionName))
                ? { ...item, quantity: newQuantity }
                : item
            )
            set(() => ({
              items: newItems,
              isDirty: true,
              ...recalculateCartTotals(newItems)
            }))

            if (get().isOnline) {
              // Online: Make API call with retry
              await retryOperation(async () => {
                const response = await apiClient.updateCartItem(productId, newQuantity)
                if (!response.success) {
                  throw new Error(response.error || 'Failed to update item quantity')
                }
                return response
              })
              
              set({ 
                lastSynced: new Date(),
                isDirty: false,
                version: get().version + 1
              })
              analytics.track('item_quantity_updated', { productId, oldQuantity: originalQuantity, newQuantity })
            } else {
              // Offline: Queue operation
              const operation: QueuedOperation = {
                id: generateOperationId(),
                type: 'update',
                data: { productId, newQuantity, selectedOptionName },
                timestamp: Date.now(),
                retries: 0
              }
              
              set((state) => ({
                operationQueue: [...state.operationQueue, operation]
              }))
              
              showToast.info('Updated quantity (will sync when online)')
            }
            
            cartBackup.save(get().items)
            
          } catch (error: any) {
            // Rollback optimistic update
            const originalQuantity = get().items.find(
              item => item.id === productId && 
                     (!selectedOptionName || 
                      item.selectedOption?.some(opt => opt.name === selectedOptionName))
            )?.quantity || 1
            
            const rollbackItems = get().items.map(item =>
              item.id === productId && 
              (!selectedOptionName || 
               item.selectedOption?.some(opt => opt.name === selectedOptionName))
                ? { ...item, quantity: originalQuantity }
                : item
            )
            set((state) => ({
              items: rollbackItems,
              error: error.message || 'Failed to update item quantity',
              isDirty: false,
              ...recalculateCartTotals(rollbackItems)
            }))
            
            showToast.error(error.message || 'Failed to update item quantity')
            analytics.track('item_quantity_update_failed', { productId, error: error.message })
          } finally {
            set({ globalLoading: false })
            get().setItemLoading(productId, null)
            performanceTracker.endTimer(startTime, 'updateQuantity')
          }
        },
        clearCart: async () => {
          const startTime = performanceTracker.startTimer('clearCart')
          const originalItems = get().items
          
          try {
            set({ globalLoading: true, error: null })
            
            // Optimistic update
            set({ 
              items: [], 
              isDirty: true,
              ...recalculateCartTotals([])
            })

            if (get().isOnline) {
              await retryOperation(async () => {
                const response = await apiClient.clearCart()
                if (!response.success) {
                  throw new Error(response.error || 'Failed to clear cart')
                }
                return response
              })
              
              set({ 
                lastSynced: new Date(),
                isDirty: false,
                version: get().version + 1
              })
              showToast.success('Cart cleared successfully')
              analytics.track('cart_cleared', { itemCount: originalItems.length })
            } else {
              const operation: QueuedOperation = {
                id: generateOperationId(),
                type: 'clear',
                data: {},
                timestamp: Date.now(),
                retries: 0
              }
              
              set((state) => ({
                operationQueue: [...state.operationQueue, operation]
              }))
              
              showToast.info('Cart cleared (will sync when online)')
            }
            
            cartBackup.clear()
            
          } catch (error: any) {
            // Rollback
            set(() => ({
              items: originalItems,
              error: error.message || 'Failed to clear cart',
              isDirty: false,
              ...recalculateCartTotals(originalItems)
            }))
            
            showToast.error(error.message || 'Failed to clear cart')
            analytics.track('cart_clear_failed', { error: error.message })
          } finally {
            set({ globalLoading: false })
            performanceTracker.endTimer(startTime, 'clearCart')
          }
        },

        loadCart: async () => {
          const startTime = performanceTracker.startTimer('loadCart')
          
          try {
            set({ globalLoading: true, error: null })
            
            const response = await apiClient.getCart()
            
            if (response.success && response.data) {

              console.log('Loaded cart from server:', response.data)
              // Transform server cart data to match our CartItem interface
              const cartItems: CartItem[] = response.data.items?.map((item: any) => ({
                id: item.product._productId || item.product._id,
                productId: item.product.productId,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                category: item.product.category,
                image: item.product.image,
                description: item.product.description,
                rating: item.product.rating,
                cookTime: item.product.cookTime,
                options: item.product.options || [],
                ingredients: item.product.ingredients || [],
                dietary: item.product.dietary || [],
                selectedOption: item.product.selectedOptions?.map((opt: any) => ({ 
                  name: opt.name, 
                  price: opt.price || 0 
                }))
              })) || []
              
              set({ 
                items: cartItems, 
                lastSynced: new Date(),
                isDirty: false,
                version: response.data.version || 0,
                ...recalculateCartTotals(cartItems)
              })
              
              cartBackup.save(cartItems)
              analytics.track('cart_loaded', { itemCount: cartItems.length })
            } else {
              set({ 
                items: [],
                ...recalculateCartTotals([])
              })
              
            }
          } catch (error: any) {
            // Try to restore from backup on load failure
            const backup = cartBackup.restore()
            if (backup && backup.items.length > 0) {
              set({ 
                items: backup.items,
                error: null,
                ...recalculateCartTotals(backup.items)
              })
              showToast.info('Cart restored from backup')
            } else {
              set({ 
                error: null,
                ...recalculateCartTotals([])
              }) // Don't show error toast for cart loading failures
            }
          } finally {
            set({ globalLoading: false })
            performanceTracker.endTimer(startTime, 'loadCart')
          }
        },

        // Enhanced methods
        validateCart: async () => {
          const startTime = performanceTracker.startTimer('validateCart')
          const issues: string[] = []
          
          try {
            // Client-side validation
            get().items.forEach(item => {
              const validation = validateCartItem(item)
              if (!validation.isValid) {
                issues.push(...validation.errors.map(error => `${item.name}: ${error}`))
              }
            })
            
            if (get().isOnline) {
              // Server-side validation
              try {
                const response = await fetch('/api/cart/validate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ items: get().items })
                })
                
                const data = await response.json()
                if (data?.issues) {
                  issues.push(...data.issues)
                }
              } catch (error) {
                issues.push('Server validation unavailable')
              }
            }
            
            const isValid = issues.length === 0
            analytics.track('cart_validated', { isValid, issueCount: issues.length })
            
            return { isValid, issues }
          } catch (error: any) {
            issues.push('Unable to validate cart with server')
            return { isValid: false, issues }
          } finally {
            performanceTracker.endTimer(startTime, 'validateCart')
          }
        },

        updateMultipleItems: async (updates) => {
          const startTime = performanceTracker.startTimer('updateMultipleItems')
          const originalItems = [...get().items]
          
          try {
            set({ globalLoading: true, error: null })
            
            // Validate all updates
            for (const update of updates) {
              if (update.quantity < 0 || update.quantity > 100) {
                throw new Error(`Invalid quantity for item ${update.id}: ${update.quantity}`)
              }
            }
            
            // Optimistic updates
            const newItems = get().items.map(item => {
              const update = updates.find(u => u.id === item.id)
              return update ? { ...item, quantity: update.quantity } : item
            })
            set(() => ({
              items: newItems,
              isDirty: true,
              ...recalculateCartTotals(newItems)
            }))
            
            if (get().isOnline) {
              await retryOperation(async () => {
                const response = await fetch('/api/cart/batch-update', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ updates })
                })
                
                const data = await response.json()
                if (!data.success) {
                  throw new Error(data.error || 'Failed to update items')
                }
                return data
              })
              
              set({ 
                lastSynced: new Date(),
                isDirty: false,
                version: get().version + 1
              })
              showToast.success(`Updated ${updates.length} items`)
              analytics.track('batch_items_updated', { updateCount: updates.length })
            } else {
              // Queue individual operations
              const operations: QueuedOperation[] = updates.map(update => ({
                id: generateOperationId(),
                type: 'update',
                data: update,
                timestamp: Date.now(),
                retries: 0
              }))
              
              set((state) => ({
                operationQueue: [...state.operationQueue, ...operations]
              }))
              
              showToast.info('Updates queued (will sync when online)')
            }
            
            cartBackup.save(get().items)
            
          } catch (error: any) {
            // Rollback all changes
            set(() => ({
              items: originalItems,
              error: error.message || 'Failed to update items',
              isDirty: false,
              ...recalculateCartTotals(originalItems)
            }))
            
            showToast.error(error.message || 'Failed to update items')
            analytics.track('batch_items_update_failed', { error: error.message })
          } finally {
            set({ globalLoading: false })
            performanceTracker.endTimer(startTime, 'updateMultipleItems')
          }
        },

        syncWithServer: async () => {
          const startTime = performanceTracker.startTimer('syncWithServer')
          
          try {
            if (!get().isOnline) {
              throw new Error('Cannot sync while offline')
            }
            
            set({ globalLoading: true })
            
            // Get latest cart from server
            await get().loadCart()
            
            // Process any queued operations
            await get().processOfflineQueue()
            
            set({ isDirty: false })
            showToast.success('Cart synced with server')
            analytics.track('cart_synced', {})
            
          } catch (error: any) {
            showToast.error('Failed to sync cart')
            analytics.track('cart_sync_failed', { error: error.message })
          } finally {
            set({ globalLoading: false })
            performanceTracker.endTimer(startTime, 'syncWithServer')
          }
        },

        processOfflineQueue: async () => {
          if (get().isProcessingQueue || !get().isOnline) return
          
          const startTime = performanceTracker.startTimer('processOfflineQueue')
          set({ isProcessingQueue: true })
          
          try {
            const queue = [...get().operationQueue]
            
            for (const operation of queue) {
              try {
                switch (operation.type) {
                  case 'add':
                    await get().addItem(
                      operation.data.product, 
                      operation.data.quantity, 
                      operation.data.selectedOption
                    )
                    break
                  case 'update':
                    await get().updateQuantity(
                      operation.data.productId || operation.data.id, 
                      operation.data.newQuantity || operation.data.quantity
                    )
                    break
                  case 'remove':
                    await get().removeItem(
                      operation.data.productId, 
                      operation.data.selectedOptionName
                    )
                    break
                  case 'clear':
                    await get().clearCart()
                    break
                }
                
                // Remove processed operation
                set((state) => ({
                  operationQueue: state.operationQueue.filter(op => op.id !== operation.id)
                }))
                
              } catch (error) {
                // Increment retry count
                const maxRetries = 3
                if (operation.retries < maxRetries) {
                  set((state) => ({
                    operationQueue: state.operationQueue.map(op =>
                      op.id === operation.id ? { ...op, retries: op.retries + 1 } : op
                    )
                  }))
                } else {
                  // Remove failed operation after max retries
                  set((state) => ({
                    operationQueue: state.operationQueue.filter(op => op.id !== operation.id)
                  }))
                  console.error('Failed to process queued operation after max retries:', operation)
                }
              }
            }
            
            const remainingOps = get().operationQueue.length
            if (remainingOps === 0) {
              showToast.success('All offline changes synced')
            } else {
              showToast.warning(`${remainingOps} operations still pending`)
            }
            
            analytics.track('offline_queue_processed', { processedCount: queue.length - remainingOps })
            
          } finally {
            set({ isProcessingQueue: false })
            performanceTracker.endTimer(startTime, 'processOfflineQueue')
          }
        },

        // Utility methods
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setItems: (items) => set({ 
          items, 
          error: null,
          ...recalculateCartTotals(items)
        }),
        setItemLoading: (itemId, state) => set((store) => ({
          loadingStates: { ...store.loadingStates, [itemId]: state }
        })),
        setOnlineStatus: (isOnline) => {
          set({ isOnline })
          if (isOnline && get().operationQueue.length > 0) {
            // Process queued operations when coming back online
            setTimeout(() => get().processOfflineQueue(), 1000)
          }
        },
        markDirty: () => set({ isDirty: true }),
        markClean: () => set({ isDirty: false, lastSynced: new Date() })
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