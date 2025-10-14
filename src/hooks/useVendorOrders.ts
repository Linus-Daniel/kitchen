import { useState, useEffect } from 'react';
import { apiClient, PaginationParams } from '@/lib/api';
import { Order } from './useOrders';

export const useVendorOrders = (filters?: PaginationParams & { status?: string }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: filters?.page || 1,
    limit: filters?.limit || 10,
    total: 0,
    count: 0,
  });

  const fetchOrders = async (newFilters?: PaginationParams & { status?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = { ...filters, ...newFilters };
      const response = await apiClient.getVendorOrders(filterParams);
      
      setOrders(response.data || []);
      setPagination({
        page: filterParams.page || 1,
        limit: filterParams.limit || 10,
        total: response.total || 0,
        count: response.count || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendor orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
    try {
      await apiClient.updateVendorOrderStatus(orderId, status);
      // Refresh orders after updating
      fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
      throw err;
    }
  };

  const changePage = (page: number) => {
    const newFilters = { ...filters, page };
    fetchOrders(newFilters);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    pagination,
    updateOrderStatus,
    changePage,
    refetch: () => fetchOrders(filters),
  };
};