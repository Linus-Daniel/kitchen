"use client"
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { FiShoppingCart, FiUser, FiHeart, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/cartContext';

type Props = {
  cartCount:number
}

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { cartCount } = useCart();

  const pathName = usePathname()

  console.log(pathName)

  const handleSearch = (e:FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/store?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/store' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <motion.p 
              className="text-2xl font-bold text-amber-600 flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="mr-1">🍔</span>
              <span>FoodExpress</span>
            </motion.p>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link href={link.path} key={link.name}>
                <motion.p 
                  className={`font-medium hover:text-amber-600 transition-colors ${
                    pathName === link.path ? 'text-amber-600' : 'text-gray-700'
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {link.name}
                </motion.p>
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search bar (desktop) */}
            <motion.form 
              onSubmit={handleSearch}
              className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2"
              whileHover={{ scale: 1.05 }}
            >
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-40"
              />
              <button type="submit">
                <FiSearch className="text-gray-500" />
              </button>
            </motion.form>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <Link href="/account">
                <motion.p 
                  className="p-2 text-gray-700 hover:text-amber-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiUser size={20} />
                </motion.p>
              </Link>
              
              <Link href="/favorites">
                <motion.p 
                  className="p-2 text-gray-700 hover:text-amber-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiHeart size={20} />
                </motion.p>
              </Link>
              
              <Link href="/cart">
                <motion.p 
                  className="p-2 text-gray-700 hover:text-amber-600 relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </motion.p>
              </Link>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 text-gray-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {/* Mobile search */}
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
                  />
                  <button type="submit">
                    <FiSearch className="text-gray-500" />
                  </button>
                </form>

                {/* Mobile navigation */}
                <nav className="flex flex-col space-y-3">
                  {navLinks.map((link) => (
                    <Link href={link.path} key={link.name}>
                      <motion.p 
                        className={`py-2 px-4 font-medium ${
                          pathName === link.path 
                            ? 'text-amber-600 bg-amber-50 rounded-lg' 
                            : 'text-gray-700'
                        }`}
                        whileHover={{ x: 5 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </motion.p>
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;