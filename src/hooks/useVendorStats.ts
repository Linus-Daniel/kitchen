import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface VendorStats {
  todayOrders: number;
  totalRevenue: number;
  activeProducts: number;
  averageRating: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  ratingChange: number;
}

export const useVendorStats = () => {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getVendorStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendor stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};