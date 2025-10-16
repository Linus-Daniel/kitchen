import { useState, useEffect } from 'react';
import { apiClient, PaginationParams } from '@/lib/api';
import { Product } from './useProducts';

export interface Favorite {
  _id: string;
  user: string;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export const useFavorites = (pagination?: PaginationParams) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationState, setPaginationState] = useState({
    page: pagination?.page || 1,
    limit: pagination?.limit || 12,
    total: 0,
    count: 0,
  });

  const fetchFavorites = async (newPagination?: PaginationParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = { ...pagination, ...newPagination };
      const response = await apiClient.getFavorites(params);
      
      setFavorites(response.data || []);
      setPaginationState({
        page: params.page || 1,
        limit: params.limit || 12,
        total: response.total || 0,
        count: response.count || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId: string): Promise<void> => {
    try {
      await apiClient.addToFavorites(productId);
      // Refresh favorites after adding
      fetchFavorites();
    } catch (err: any) {
      setError(err.message || 'Failed to add to favorites');
      throw err;
    }
  };

  const removeFromFavorites = async (productId: string): Promise<void> => {
    try {
      await apiClient.removeFromFavorites(productId);
      // Refresh favorites after removing
      fetchFavorites();
    } catch (err: any) {
      setError(err.message || 'Failed to remove from favorites');
      throw err;
    }
  };

  const toggleFavorite = async (productId: string): Promise<boolean> => {
    try {
      const checkResponse = await apiClient.checkFavorite(productId);
      if (checkResponse.data?.isFavorite) {
        await removeFromFavorites(productId);
        return false;
      } else {
        await addToFavorites(productId);
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle favorite');
      throw err;
    }
  };

  const changePage = (page: number) => {
    const newPagination = { ...pagination, page };
    fetchFavorites(newPagination);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return {
    favorites,
    loading,
    error,
    pagination: paginationState,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    changePage,
    refetch: () => fetchFavorites(pagination),
  };
};

export const useFavoriteStatus = (productId: string) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkFavoriteStatus = async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.checkFavorite(productId);
      setIsFavorite(response.data?.isFavorite || false);
    } catch (err: any) {
      setError(err.message || 'Failed to check favorite status');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (): Promise<boolean> => {
    try {
      if (isFavorite) {
        await apiClient.removeFromFavorites(productId);
        setIsFavorite(false);
        return false;
      } else {
        await apiClient.addToFavorites(productId);
        setIsFavorite(true);
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle favorite');
      throw err;
    }
  };

  useEffect(() => {
    checkFavoriteStatus();
  }, [productId]);

  return {
    isFavorite,
    loading,
    error,
    toggleFavorite,
    refetch: checkFavoriteStatus,
  };
};