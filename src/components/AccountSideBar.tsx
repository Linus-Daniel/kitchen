// components/AccountSidebar.tsx
"use client"

import { useAuth } from '@/context/authContext';
import { FiUser, FiMapPin, FiCreditCard, FiClock, FiLogOut, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export const AccountSidebar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes or on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    setIsMobileMenuOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pathname]);

  const navItems = [
    { href: '/account', icon: FiUser, label: 'Dashboard' },
    { href: '/account/orders', icon: FiClock, label: 'My Orders' },
    { href: '/account/addresses', icon: FiMapPin, label: 'Addresses' },
    { href: '/account/payment', icon: FiCreditCard, label: 'Payment Methods' },
  ];

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white border-b sticky top-0 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center space-x-2 text-gray-700"
          aria-expanded={isMobileMenuOpen}
          aria-label="Account menu"
        >
          {isMobileMenuOpen ? (
            <FiX size={24} className="text-amber-600" />
          ) : (
            <FiMenu size={24} />
          )}
          <span className="font-medium">Menu</span>
        </button>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-2">
            <FiUser size={16} />
          </div>
          <span className="font-medium text-sm">{user?.name}</span>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block sticky top-4 h-fit rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-4">
            <FiUser size={20} />
          </div>
          <div>
            <h3 className="font-bold">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center p-3 rounded-lg font-medium',
                pathname === item.href
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <item.icon className="mr-3" />
              {item.label}
            </a>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="md:hidden  fixed inset-0 z-30 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.aside
              className="fixed inset-y-0 left-0 z-40 w-80 max-w-full bg-white overflow-y-auto shadow-xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center mb-6 pt-6 px-6">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-4">
                  <FiUser size={20} />
                </div>
                <div>
                  <h3 className="font-bold">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  aria-label="Close menu"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <nav className="space-y-1 p-2">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center p-3 rounded-lg font-medium',
                      pathname === item.href
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className="mr-3" />
                    {item.label}
                  </a>
                ))}
                <button
                  onClick={logout}
                  className="w-full flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <FiLogOut className="mr-3" />
                  Logout
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};