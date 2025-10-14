import { useState, useEffect } from 'react';
import { apiClient, PaginationParams } from '@/lib/api';

export interface Notification {
  _id: string;
  recipient: string;
  recipientModel: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const useNotifications = (filters?: PaginationParams & { isRead?: boolean; type?: string }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [pagination, setPagination] = useState({
    page: filters?.page || 1,
    limit: filters?.limit || 20,
    total: 0,
    count: 0,
  });

  const fetchNotifications = async (newFilters?: PaginationParams & { isRead?: boolean; type?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = { ...filters, ...newFilters };
      const response = await apiClient.getNotifications(filterParams);
      
      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
      setPagination({
        page: filterParams.page || 1,
        limit: filterParams.limit || 20,
        total: response.total || 0,
        count: response.count || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      await apiClient.markNotificationRead(notificationId, true);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
      throw err;
    }
  };

  const markAsUnread = async (notificationId: string): Promise<void> => {
    try {
      await apiClient.markNotificationRead(notificationId, false);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: false, readAt: undefined }
            : notification
        )
      );
      // Update unread count
      setUnreadCount(prev => prev + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as unread');
      throw err;
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      await apiClient.markAllNotificationsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          isRead: true, 
          readAt: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
      throw err;
    }
  };

  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      await apiClient.deleteNotification(notificationId);
      // Update local state
      const notificationToDelete = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (notificationToDelete && !notificationToDelete.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
      throw err;
    }
  };

  const changePage = (page: number) => {
    const newFilters = { ...filters, page };
    fetchNotifications(newFilters);
  };

  const changeFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    fetchNotifications(updatedFilters);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    pagination,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    changePage,
    changeFilters,
    refetch: () => fetchNotifications(filters),
  };
};