import { useState, useEffect } from 'react';
import { apiClient, OrderData, PaginationParams } from '@/lib/api';

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  orderItems: Array<{
    product: string;
    name: string;
    quantity: number;
    selectedOptions: Array<{ name: string; choice: string }>;
    price: number;
  }>;
  vendorOrders: Array<{
    vendor: {
      _id: string;
      businessName: string;
      logo?: string;
    };
    vendorName: string;
    items: Array<{
      product: string;
      name: string;
      quantity: number;
      selectedOptions: Array<{ name: string; choice: string }>;
      price: number;
    }>;
    subtotal: number;
    deliveryFee: number;
    status: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  orderStatus: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export const useOrders = (filters?: PaginationParams & { status?: string }) => {
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
      const response = await apiClient.getOrders(filterParams);
      
      setOrders(response.data || []);
      setPagination({
        page: filterParams.page || 1,
        limit: filterParams.limit || 10,
        total: response.total || 0,
        count: response.count || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: OrderData): Promise<Order> => {
    try {
      const response = await apiClient.createOrder(orderData);
      // Refresh orders after creating
      fetchOrders();
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string): Promise<void> => {
    try {
      await apiClient.updateOrderStatus(orderId, status);
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
    createOrder,
    updateOrderStatus,
    changePage,
    refetch: () => fetchOrders(filters),
  };
};

export const useOrder = (id: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getOrder(id);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  return { order, loading, error, refetch: fetchOrder };
};