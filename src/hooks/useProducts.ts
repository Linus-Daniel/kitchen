import { useState, useEffect } from 'react';
import { apiClient, ProductFilters } from '@/lib/api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  vendor: {
    _id: string;
    businessName: string;
    rating: number;
    logo?: string;
    estimatedDeliveryTime?: string;
  };
  rating: number;
  numReviews: number;
  cookTime: string;
  options: Array<{
    name: string;
    choices: string[];
    required: boolean;
  }>;
  ingredients: string[];
  dietary?: string[];
  isAvailable: boolean;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export const useProducts = (initialFilters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters || {});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    count: 0,
  });
  const [availableFilters, setAvailableFilters] = useState<{
    categories: string[];
    priceRange: { minPrice: number; maxPrice: number };
  } | null>(null);

  const fetchProducts = async (newFilters?: ProductFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = { ...filters, ...newFilters };
      const response = await apiClient.getProducts(filterParams);
      
      setProducts(response.data || []);
      setPagination({
        page: filterParams.page || 1,
        limit: filterParams.limit || 12,
        total: response.total || 0,
        count: response.count || 0,
      });
      
      if (response.filters) {
        setAvailableFilters(response.filters);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchProducts(updatedFilters);
  };

  const changePage = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchProducts(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { page: 1, limit: filters.limit || 12 };
    setFilters(clearedFilters);
    fetchProducts(clearedFilters);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    filters,
    pagination,
    availableFilters,
    updateFilters,
    changePage,
    clearFilters,
    refetch: () => fetchProducts(filters),
  };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getProduct(id);
      setProduct(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  return { product, loading, error, refetch: fetchProduct };
};