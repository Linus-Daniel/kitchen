import { useState, useEffect } from 'react';
import { apiClient, PaginationParams } from '@/lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'vendor' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useAdminUsers = (filters?: PaginationParams & { role?: string; isActive?: boolean }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: filters?.page || 1,
    limit: filters?.limit || 10,
    total: 0,
    count: 0,
  });

  const fetchUsers = async (newFilters?: PaginationParams & { role?: string; isActive?: boolean }) => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = { ...filters, ...newFilters };
      const response = await apiClient.getAdminUsers(filterParams);
      
      setUsers(response.data || []);
      setPagination({
        page: filterParams.page || 1,
        limit: filterParams.limit || 10,
        total: response.total || 0,
        count: response.count || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
    try {
      await apiClient.updateUserStatus(userId, isActive);
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isActive } : user
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
      throw err;
    }
  };

  const deleteUser = async (userId: string): Promise<void> => {
    try {
      await apiClient.deleteUser(userId);
      // Remove from local state
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      throw err;
    }
  };

  const changePage = (page: number) => {
    const newFilters = { ...filters, page };
    fetchUsers(newFilters);
  };

  const changeFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    fetchUsers(updatedFilters);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    pagination,
    updateUserStatus,
    deleteUser,
    changePage,
    changeFilters,
    refetch: () => fetchUsers(filters),
  };
};