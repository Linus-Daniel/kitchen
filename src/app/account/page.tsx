"use client"
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUser, FiMapPin, FiCreditCard, FiClock, FiLogOut, FiShoppingBag } from 'react-icons/fi';
import clsx from 'clsx';

// Constants for static data
const STATS = [
  { name: 'Total Orders', value: 12, icon: FiShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { name: 'Pending Orders', value: 2, icon: FiClock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { name: 'Saved Addresses', value: 3, icon: FiMapPin, color: 'text-green-600', bgColor: 'bg-green-100' },
  { name: 'Payment Methods', value: 1, icon: FiCreditCard, color: 'text-purple-600', bgColor: 'bg-purple-100' }
];

const RECENT_ORDERS = [
  { id: '#12345', date: '2023-05-15', total: 32.97, status: 'Delivered' },
  { id: '#12344', date: '2023-05-10', total: 24.98, status: 'Delivered' },
  { id: '#12343', date: '2023-05-05', total: 18.99, status: 'Cancelled' }
];

type OrderStatus = 'Delivered' | 'Cancelled' | string;

const AccountDashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content - spans full width on mobile, 3/4 on desktop */}
        <div className="lg:col-span-3 space-y-6">
          {/* Account Overview Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Account Overview</h2>
            
            {/* Stats Grid - 1 column on mobile, 2 on sm+, full width */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {STATS.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor} ${stat.color} mr-3 sm:mr-4`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">{stat.name}</p>
                    <p className="text-base sm:text-xl font-bold">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Recent Orders Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-medium text-gray-700 text-sm sm:text-base">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                      <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {RECENT_ORDERS.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-amber-600">
                          {order.id}
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.date}
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className={clsx(
                            'px-2 py-1 text-xs rounded-full',
                            getStatusClass(order.status)
                          )}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
          
          {/* Account Details Card */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Account Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || ''}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6">
              <button className="bg-amber-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-amber-700 transition-colors text-sm sm:text-base">
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;