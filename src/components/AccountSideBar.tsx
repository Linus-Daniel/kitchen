// components/AccountSidebar.tsx
"use client"

import { useAuth } from '@/context/authContext';
import { FiUser, FiMapPin, FiCreditCard, FiClock, FiLogOut, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const AccountSidebar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden flex justify-between items-center mb-4 p-4 bg-white rounded-xl shadow-sm">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center space-x-2 text-gray-700"
        >
          {isMobileMenuOpen ? (
            <FiX size={24} className="text-amber-600" />
          ) : (
            <FiMenu size={24} />
          )}
          <span className="font-medium">Menu</span>
        </button>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-3">
            <FiUser size={18} />
          </div>
          <span className="font-medium text-sm">{user?.name}</span>
        </div>
      </div>

      {/* Sidebar content */}
      <AnimatePresence>
        {(isMobileMenuOpen || !isMobileMenuOpen) && (
          <motion.div
            className={`bg-white rounded-xl shadow-sm p-6 ${
              isMobileMenuOpen
                ? 'fixed inset-0 z-50 overflow-y-auto md:relative md:block'
                : 'hidden md:block sticky top-4'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Close button for mobile */}
            {isMobileMenuOpen && (
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            )}

            {/* User info - hidden on mobile when menu is closed */}
            <div className={`${isMobileMenuOpen ? 'block' : 'hidden md:flex'} items-center mb-6`}>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-4">
                <FiUser size={20} />
              </div>
              <div>
                <h3 className="font-bold">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <a
                href="/account"
                className={`flex items-center p-2 rounded-lg font-medium ${
                  pathname === '/account'
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiUser className="mr-3" />
                Dashboard
              </a>
              <a
                href="/account/orders"
                className={`flex items-center p-2 rounded-lg ${
                  pathname.startsWith('/account/orders')
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiClock className="mr-3" />
                My Orders
              </a>
              <a
                href="/account/addresses"
                className={`flex items-center p-2 rounded-lg ${
                  pathname.startsWith('/account/addresses')
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiMapPin className="mr-3" />
                Addresses
              </a>
              <a
                href="/account/payment"
                className={`flex items-center p-2 rounded-lg ${
                  pathname.startsWith('/account/payment')
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiCreditCard className="mr-3" />
                Payment Methods
              </a>
              <button
                onClick={logout}
                className="w-full flex items-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <FiLogOut className="mr-3" />
                Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};