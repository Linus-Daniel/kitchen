"use client"
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiClock, FiCheck, FiX, FiShoppingBag, FiUser, FiMapPin, FiCreditCard } from 'react-icons/fi';

const OrdersPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const orders = [
    {
      id: '#12345',
      date: '2023-05-15',
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 12.99 },
        { name: 'Garlic Bread', quantity: 2, price: 4.99 }
      ],
      total: 22.97,
      status: 'Delivered',
      deliveryAddress: '123 Main St, New York, NY 10001'
    },
    {
      id: '#12344',
      date: '2023-05-10',
      items: [
        { name: 'Pepperoni Pizza', quantity: 1, price: 14.99 },
        { name: 'Caesar Salad', quantity: 1, price: 9.99 }
      ],
      total: 24.98,
      status: 'Delivered',
      deliveryAddress: '123 Main St, New York, NY 10001'
    },
    {
      id: '#12343',
      date: '2023-05-05',
      items: [
        { name: 'Veggie Burger', quantity: 1, price: 9.99 },
        { name: 'French Fries', quantity: 1, price: 3.99 },
        { name: 'Iced Tea', quantity: 1, price: 2.99 }
      ],
      total: 16.97,
      status: 'Cancelled',
      deliveryAddress: '123 Main St, New York, NY 10001'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 sticky top-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-4">
                <FiShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-bold">Order History</h3>
                <p className="text-sm text-gray-500">{orders.length} orders</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <a href="/account" className="flex items-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <FiUser className="mr-3" />
                Dashboard
              </a>
              <a href="#" className="flex items-center p-2 text-amber-600 bg-amber-50 rounded-lg font-medium">
                <FiClock className="mr-3" />
                My Orders
              </a>
              <a href="/account/addresses" className="flex items-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <FiMapPin className="mr-3" />
                Addresses
              </a>
              <a href="/account/payment" className="flex items-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <FiCreditCard className="mr-3" />
                Payment Methods
              </a>
            </nav>
          </motion.div>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3">
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold mb-6">My Orders</h2>
            
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-200">
                    <div>
                      <span className="font-medium">Order {order.id}</span>
                      <span className="text-gray-500 text-sm ml-4">{order.date}</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                      <ul className="space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span>
                              {item.quantity} × {item.name}
                            </span>
                            <span>${item.price.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Delivery Address</h4>
                        <p className="text-gray-600">{order.deliveryAddress}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="mb-2">
                          <span className="text-gray-600 mr-2">Subtotal:</span>
                          <span>${(order.total - 2.99).toFixed(2)}</span>
                        </div>
                        <div className="mb-2">
                          <span className="text-gray-600 mr-2">Delivery Fee:</span>
                          <span>$2.99</span>
                        </div>
                        <div className="font-bold text-lg">
                          <span className="text-gray-600 mr-2">Total:</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        View Details
                      </button>
                      {order.status === 'Delivered' && (
                        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;