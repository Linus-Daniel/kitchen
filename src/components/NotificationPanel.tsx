"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiCheck, FiTrash2, FiLoader } from 'react-icons/fi';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

interface NotificationPanelProps {
  className?: string;
}

export const NotificationPanel = ({ className = '' }: NotificationPanelProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAsUnread, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications({
    page: 1,
    limit: 20,
    isRead: filter === 'unread' ? false : undefined
  });

  if (!user) return null;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAsUnread = async (notificationId: string) => {
    try {
      await markAsUnread(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
        return '🛒';
      case 'order_confirmed':
        return '✅';
      case 'order_preparing':
        return '👨‍🍳';
      case 'order_ready':
        return '🍽️';
      case 'order_delivered':
        return '🚚';
      case 'order_cancelled':
        return '❌';
      case 'payment_received':
        return '💳';
      case 'review_received':
        return '⭐';
      case 'product_approved':
        return '✅';
      case 'product_rejected':
        return '❌';
      case 'vendor_approved':
        return '🎉';
      case 'vendor_rejected':
        return '❌';
      case 'general':
        return '📢';
      default:
        return '🔔';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors group"
      >
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 3 }}
        >
          <FiBell size={20} />
        </motion.div>
        
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
        
        {/* Pulse ring for new notifications */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-red-400 -z-10"
          />
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={18} />
                  </button>
                </div>
                
                {/* Filter and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        filter === 'all' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        filter === 'unread' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>
                  
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-amber-600 hover:text-amber-700"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <FiLoader className="animate-spin text-amber-600" size={20} />
                    <span className="ml-2 text-gray-500">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">
                    Error loading notifications
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </div>
                ) : (
                  <div className="py-2">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 border-l-4 hover:bg-gray-50 ${
                          notification.isRead 
                            ? 'border-l-gray-200 bg-gray-50/50' 
                            : 'border-l-amber-400 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  notification.isRead ? 'text-gray-600' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  notification.isRead ? 'text-gray-500' : 'text-gray-700'
                                }`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => 
                                    notification.isRead 
                                      ? handleMarkAsUnread(notification._id)
                                      : handleMarkAsRead(notification._id)
                                  }
                                  className="p-1 text-gray-400 hover:text-amber-600 rounded"
                                  title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                                >
                                  <FiCheck size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(notification._id)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                  title="Delete notification"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 text-center">
                  <button 
                    className="text-sm text-amber-600 hover:text-amber-700"
                    onClick={() => setIsOpen(false)}
                  >
                    View All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};