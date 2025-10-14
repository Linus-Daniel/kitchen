'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { FiShoppingCart, FiUser, FiHeart, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { FormEvent, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/context/cartContext';
import { useAuth } from '@/context/authContext';
import { NotificationPanel } from './NotificationPanel';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/store' },
  { name: 'About', path: '/#about' },
  { name: 'Contact', path: '/#contact' },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathName = usePathname();
  const { cartCount } = useCart();
  const { user } = useAuth();

  if (pathName.startsWith('/admin')) return null;

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/store?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  }, [searchQuery, router]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" passHref legacyBehavior>
            <motion.p 
              className="text-xl sm:text-2xl font-bold text-amber-600 flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="mr-1">🍔</span>
              <span>FoodExpress</span>
            </motion.p>
          </Link>

          {/* Mobile menu toggle */}
          <button 
            className="md:hidden p-2 text-gray-700"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Desktop nav + search + user area */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              {NAV_LINKS.map((link) => (
                <Link href={link.path} key={link.name} passHref legacyBehavior>
                  <motion.a
                    className={`font-medium hover:text-amber-600 transition-colors ${
                      pathName === link.path ? 'text-amber-600' : 'text-gray-700'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    {link.name}
                  </motion.a>
                </Link>
              ))}
            </nav>

            <motion.form 
              onSubmit={handleSearch}
              className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-1"
              whileHover={{ scale: 1.05 }}
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-32 lg:w-48"
              />
              <button type="submit" aria-label="Search">
                <FiSearch className="text-gray-500" />
              </button>
            </motion.form>

            {user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <NotificationPanel />

                <Link href="/account" passHref legacyBehavior>
                  <motion.a 
                    className="p-2 text-gray-700 hover:text-amber-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiUser size={20} />
                  </motion.a>
                </Link>

                <Link href="/favorites" passHref legacyBehavior>
                  <motion.a 
                    className="p-2 text-gray-700 hover:text-amber-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiHeart size={20} />
                  </motion.a>
                </Link>

                <Link href="/cart" passHref legacyBehavior>
                  <motion.a 
                    className="p-2 text-gray-700 hover:text-amber-600 relative"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {Math.min(cartCount, 99)}
                      </span>
                    )}
                  </motion.a>
                </Link>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" className="bg-amber-400 px-4 py-1 rounded-2xl text-sm hover:bg-amber-500 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="text-sm px-4 py-1 border-2 rounded-full border-amber-400 hover:border-amber-500 transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4">
                <form 
                  onSubmit={handleSearch}
                  className="flex items-center bg-gray-100 rounded-full px-4 py-2"
                >
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none flex-1"
                    aria-label="Search dishes"
                  />
                  <button type="submit" aria-label="Search">
                    <FiSearch className="text-gray-500" />
                  </button>
                </form>

                <nav className="flex flex-col space-y-3">
                  {NAV_LINKS.map((link) => (
                    <Link href={link.path} key={link.name} passHref legacyBehavior>
                      <motion.a
                        className={`py-2 px-4 font-medium ${
                          pathName === link.path 
                            ? 'text-amber-600 bg-amber-50 rounded-lg' 
                            : 'text-gray-700'
                        }`}
                        whileHover={{ x: 5 }}
                        onClick={closeMobileMenu}
                      >
                        {link.name}
                      </motion.a>
                    </Link>
                  ))}
                </nav>

                {!user && (
                  <div className="flex flex-col gap-3 px-4">
                    <Link href="/login" className="bg-amber-400 text-center py-2 rounded-xl text-sm hover:bg-amber-500 transition-colors">
                      Login
                    </Link>
                    <Link href="/register" className="text-center text-sm py-2 border-2 rounded-full border-amber-400 hover:border-amber-500 transition-colors">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
