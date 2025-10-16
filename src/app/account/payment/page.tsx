"use client"
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCreditCard, FiPlus, FiEdit, FiTrash2, FiUser, FiClock, FiMapPin } from 'react-icons/fi';

const PaymentPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const paymentMethods = [
    {
      id: 1,
      type: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 2,
      type: 'Mastercard',
      last4: '5555',
      expiry: '03/24',
      isDefault: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-8">
  
        {/* Main content */}
        <div className="md:col-span-3">
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">My Payment Methods</h2>
              <button className="flex items-center bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700">
                <FiPlus className="mr-2" />
                Add New Card
              </button>
            </div>
            
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  className={`border rounded-lg p-6 relative ${
                    method.isDefault 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  {method.isDefault && (
                    <span className="absolute top-4 right-4 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                  
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center mr-4">
                      {method.type === 'Visa' ? (
                        <span className="text-blue-600 font-bold">VISA</span>
                      ) : (
                        <span className="text-red-600 font-bold">MC</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{method.type} ending in {method.last4}</h3>
                      <p className="text-gray-600 text-sm">Expires {method.expiry}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="flex items-center text-amber-600 hover:text-amber-700">
                      <FiEdit className="mr-1" />
                      Edit
                    </button>
                    {!method.isDefault && (
                      <button className="flex items-center text-red-600 hover:text-red-700">
                        <FiTrash2 className="mr-1" />
                        Remove
                      </button>
                    )}
                    {!method.isDefault && (
                      <button className="flex items-center text-gray-600 hover:text-gray-700 ml-auto">
                        Set as Default
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-8">
              <h3 className="font-medium text-gray-700 mb-4">Add New Payment Method</h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="default-card"
                    name="default-card"
                    type="checkbox"
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="default-card" className="ml-2 block text-sm text-gray-700">
                    Set as default payment method
                  </label>
                </div>
                
                <div className="pt-2">
                  <button className="bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-amber-700">
                    Save Card
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;