// Enhanced cart store methods - Part 2

// updateQuantity method
const updateQuantityMethod = `
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
    set((state) => ({
      items: state.items.map(item =>
        item.id === productId && 
        (!selectedOptionName || 
         item.selectedOption?.some(opt => opt.name === selectedOptionName))
          ? { ...item, quantity: newQuantity }
          : item
      ),
      isDirty: true
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
    set((state) => ({
      items: state.items.map(item =>
        item.id === productId && 
        (!selectedOptionName || 
         item.selectedOption?.some(opt => opt.name === selectedOptionName))
          ? { ...item, quantity: originalQuantity }
          : item
      ),
      error: error.message || 'Failed to update item quantity',
      isDirty: false
    }))
    
    showToast.error(error.message || 'Failed to update item quantity')
    analytics.track('item_quantity_update_failed', { productId, error: error.message })
  } finally {
    set({ globalLoading: false })
    get().setItemLoading(productId, null)
    performanceTracker.endTimer(startTime, 'updateQuantity')
  }
},`

// Additional methods
const additionalMethods = `
clearCart: async () => {
  const startTime = performanceTracker.startTimer('clearCart')
  
  try {
    set({ globalLoading: true, error: null })
    
    const originalItems = get().items
    
    // Optimistic update
    set({ items: [], isDirty: true })

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
    set((state) => ({
      items: originalItems,
      error: error.message || 'Failed to clear cart',
      isDirty: false
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
      // Transform server cart data to match our CartItem interface
      const cartItems: CartItem[] = response.data.items?.map((item: any) => ({
        id: item.productId || item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        image: item.image,
        description: item.description,
        rating: item.rating,
        cookTime: item.cookTime,
        options: item.options || [],
        ingredients: item.ingredients || [],
        dietary: item.dietary || [],
        selectedOption: item.selectedOptions?.map((opt: any) => ({ 
          name: opt.name, 
          price: opt.price || 0 
        }))
      })) || []
      
      set({ 
        items: cartItems, 
        lastSynced: new Date(),
        isDirty: false,
        version: response.data.version || 0
      })
      
      cartBackup.save(cartItems)
      analytics.track('cart_loaded', { itemCount: cartItems.length })
    } else {
      set({ items: [] })
    }
  } catch (error: any) {
    // Try to restore from backup on load failure
    const backup = cartBackup.restore()
    if (backup && backup.items.length > 0) {
      set({ 
        items: backup.items,
        error: null
      })
      showToast.info('Cart restored from backup')
    } else {
      set({ error: null }) // Don't show error toast for cart loading failures
    }
  } finally {
    set({ globalLoading: false })
    performanceTracker.endTimer(startTime, 'loadCart')
  }
},

validateCart: async () => {
  const startTime = performanceTracker.startTimer('validateCart')
  const issues: string[] = []
  
  try {
    // Client-side validation
    get().items.forEach(item => {
      const validation = validateCartItem(item)
      if (!validation.isValid) {
        issues.push(...validation.errors.map(error => \`\${item.name}: \${error}\`))
      }
    })
    
    if (get().isOnline) {
      // Server-side validation
      const response = await apiClient.request({
        method: 'POST',
        url: '/cart/validate',
        data: { items: get().items }
      })
      
      if (response.data?.issues) {
        issues.push(...response.data.issues)
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
  
  try {
    set({ globalLoading: true, error: null })
    
    // Validate all updates
    for (const update of updates) {
      if (update.quantity < 0 || update.quantity > 100) {
        throw new Error(\`Invalid quantity for item \${update.id}: \${update.quantity}\`)
      }
    }
    
    const originalItems = [...get().items]
    
    // Optimistic updates
    set((state) => ({
      items: state.items.map(item => {
        const update = updates.find(u => u.id === item.id)
        return update ? { ...item, quantity: update.quantity } : item
      }),
      isDirty: true
    }))
    
    if (get().isOnline) {
      await retryOperation(async () => {
        const response = await apiClient.request({
          method: 'PUT',
          url: '/cart/batch-update',
          data: { updates }
        })
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to update items')
        }
        return response
      })
      
      set({ 
        lastSynced: new Date(),
        isDirty: false,
        version: get().version + 1
      })
      showToast.success(\`Updated \${updates.length} items\`)
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
    set((state) => ({
      items: originalItems,
      error: error.message || 'Failed to update items',
      isDirty: false
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
    analytics.track('cart_synced')
    
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
      showToast.warning(\`\${remainingOps} operations still pending\`)
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
setItems: (items) => set({ items, error: null }),
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
`

export { additionalMethods }