"use client"
import { useAuth } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMapPin, FiPlus, FiEdit, FiTrash2, FiUser, FiClock, FiCreditCard } from 'react-icons/fi';

const AddressesPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push('/login');
    return null;
  }

  const addresses = [
    {
      id: 1,
      name: 'Home',
      address: '123 Main Street, Apartment 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '+1 (555) 123-4567',
      isDefault: true
    },
    {
      id: 2,
      name: 'Work',
      address: '456 Business Ave, Floor 5',
      city: 'New York',
      state: 'NY',
      zip: '10002',
      phone: '+1 (555) 987-6543',
      isDefault: false
    },
    {
      id: 3,
      name: 'Parents',
      address: '789 Family Road',
      city: 'Brooklyn',
      state: 'NY',
      zip: '11201',
      phone: '+1 (555) 456-7890',
      isDefault: false
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
                <FiMapPin size={20} />
              </div>
              <div>
                <h3 className="font-bold">Saved Addresses</h3>
                <p className="text-sm text-gray-500">{addresses.length} addresses</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <a href="/account" className="flex items-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <FiUser className="mr-3" />
                Dashboard
              </a>
              <a href="/account/orders" className="flex items-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <FiClock className="mr-3" />
                My Orders
              </a>
              <a href="#" className="flex items-center p-2 text-amber-600 bg-amber-50 rounded-lg font-medium">
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">My Addresses</h2>
              <button className="flex items-center bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700">
                <FiPlus className="mr-2" />
                Add New Address
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  className={`border rounded-lg p-6 relative ${
                    address.isDefault 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  {address.isDefault && (
                    <span className="absolute top-4 right-4 bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                  
                  <h3 className="font-bold text-lg mb-2">{address.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {address.address}<br />
                    {address.city}, {address.state} {address.zip}<br />
                    {address.phone}
                  </p>
                  
                  <div className="flex space-x-3">
                    <button className="flex items-center text-amber-600 hover:text-amber-700">
                      <FiEdit className="mr-1" />
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button className="flex items-center text-red-600 hover:text-red-700">
                        <FiTrash2 className="mr-1" />
                        Remove
                      </button>
                    )}
                    {!address.isDefault && (
                      <button className="flex items-center text-gray-600 hover:text-gray-700 ml-auto">
                        Set as Default
                      </button>
                    )}
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

export default AddressesPage;