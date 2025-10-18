import { useState, useEffect, useRef } from 'react';
import { apiClient, PaginationParams } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

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
  const { user } = useAuth();
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
  const socketRef = useRef<Socket | null>(null);

  const fetchNotifications = async (newFilters?: PaginationParams & { isRead?: boolean; type?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = { ...filters, ...newFilters };
      if (user?.role ==="user"){

        const response = await apiClient.getNotifications(filterParams);
        
        setNotifications(response.data || []);
        setUnreadCount(response.unreadCount || 0);
        setPagination({
          page: filterParams.page || 1,
          limit: filterParams.limit || 20,
          total: response.total || 0,
          count: response.count || 0,
        });
      }
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

  // Initialize Socket.IO connection for real-time notifications
  useEffect(() => {
    if (!user) return;

    // Connect to Socket.IO server
    socketRef.current = io(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000', {
      path: '/api/socket',
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Join appropriate room based on user role
    if (user.role === 'vendor') {
      socket.emit('join-vendor-room', user.id);
    } else {
      socket.emit('join-user-room', user.id);
    }

    // Listen for new notifications
    socket.on('new-notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show toast notification
      toast.success(notification.title, {
        duration: 5000,
        icon: '🔔',
      });
    });

    // Listen for notification count updates
    socket.on('notification-count-update', (data: { unreadCount: number }) => {
      setUnreadCount(data.unreadCount);
    });

    // Listen for specific order events
    socket.on('new-order', (data: any) => {
      toast.success('New Order Received!', {
        duration: 6000,
        icon: '🛒',
      });
    });

    socket.on('order-update', (data: any) => {
      toast.success('Order Status Updated', {
        duration: 4000,
        icon: '📋',
      });
    });

    socket.on('payment-confirmed', (data: any) => {
      toast.success('Payment Confirmed!', {
        duration: 5000,
        icon: '💳',
      });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user]);

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