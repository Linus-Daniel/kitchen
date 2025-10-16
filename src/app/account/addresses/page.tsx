"use client"
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMapPin, FiPlus, FiEdit, FiTrash2, FiUser, FiClock, FiCreditCard } from 'react-icons/fi';

const AddressesPage = () => {
  const { user } = useAuth();
  const router = useRouter();
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