"use client"
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiClock, FiCheck, FiX, FiShoppingBag, FiUser, FiMapPin, FiCreditCard, FiLoader } from 'react-icons/fi';
import { useOrders } from '@/hooks/useOrders';
import { useState } from 'react';

const OrdersPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { 
    orders, 
    loading, 
    error, 
    pagination, 
    changePage 
  } = useOrders({ 
    page: 1, 
    limit: 10,
    status: statusFilter || undefined 
  });

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <FiLoader className="animate-spin text-amber-600 mr-2" size={24} />
            <span className="text-gray-600">Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center py-12">
            <FiX className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Orders</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <FiCheck className="text-green-600" />;
      case 'cancelled':
        return <FiX className="text-red-600" />;
      case 'processing':
        return <FiClock className="text-blue-600" />;
      default:
        return <FiShoppingBag className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="">
        {/* Main content */}
        <div className="md:col-span-3">
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">My Orders</h2>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <FiShoppingBag className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Orders Yet</h3>
                <p className="text-gray-500">Start shopping to see your orders here!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                <motion.div
                  key={order._id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-200">
                    <div>
                      <span className="font-medium">Order #{order._id.slice(-6)}</span>
                      <span className="text-gray-500 text-sm ml-4">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.orderStatus)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                      <ul className="space-y-2">
                        {order.orderItems.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>
                              {item.quantity} × {item.name}
                              {item.selectedOptions && item.selectedOptions.length > 0 && (
                                <span className="text-gray-500 text-sm ml-2">
                                  ({item.selectedOptions.map(opt => `${opt.name}: ${opt.choice}`).join(', ')})
                                </span>
                              )}
                            </span>
                            <span>${item.price.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Delivery Address</h4>
                        <div className="text-gray-600">
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="mb-2">
                          <span className="text-gray-600 mr-2">Items Price:</span>
                          <span>${order.itemsPrice.toFixed(2)}</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-gray-600 mr-2">Shipping:</span>
                          <span>${order.shippingPrice.toFixed(2)}</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-gray-600 mr-2">Tax:</span>
                          <span>${order.taxPrice.toFixed(2)}</span>
                        </div>
                        <div className="font-bold text-lg">
                          <span className="text-gray-600 mr-2">Total:</span>
                          <span>${order.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button 
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        onClick={() => router.push(`/account/orders/${order._id}`)}
                      >
                        View Details
                      </button>
                      {order.orderStatus.toLowerCase() === 'delivered' && (
                        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => changePage(i + 1)}
                      className={`px-3 py-2 rounded-lg ${
                        pagination.page === i + 1
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;