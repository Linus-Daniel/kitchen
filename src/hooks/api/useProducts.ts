import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { apiClient, ProductFilters } from '@/lib/api'

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiClient.getProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useInfiniteProducts(filters?: ProductFilters) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => 
      apiClient.getProducts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil((lastPage.total || 0) / (filters?.limit || 10))
      return allPages.length < totalPages ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (productData: any) => apiClient.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] })
    }
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: any }) => 
      apiClient.updateProduct(id, productData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] })
    }
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['vendor', 'products'] })
    }
  })
}

export function useSearch(query: string, type?: string) {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => apiClient.search(query, type),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}