import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface VendorStats {
  todayOrders?: number;
  totalRevenue: number;
  productCount: number;
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
      const response = await apiClient.getVendorAnalytics();
      setStats(response.data.summary);
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