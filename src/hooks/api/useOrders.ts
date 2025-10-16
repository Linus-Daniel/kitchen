import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, OrderData, PaginationParams } from '@/lib/api'

export function useOrders(filters?: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => apiClient.getOrders(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => apiClient.getOrder(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (orderData: OrderData) => apiClient.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiClient.updateOrderStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['vendor', 'orders'] })
    }
  })
}

// Vendor-specific order hooks
export function useVendorOrders(filters?: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: ['vendor', 'orders', filters],
    queryFn: () => apiClient.getVendorOrders(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useUpdateVendorOrderStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      apiClient.updateVendorOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}