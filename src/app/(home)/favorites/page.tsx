'use client';

import { motion } from 'framer-motion';
import { useFavorites } from '@/hooks/useFavorites';
import ProductCard from '@/components/foodCard';
import { useState } from 'react';
import ProductModal from '@/components/ProductModal';
import { Product } from '@/hooks/useProducts';
import Link from 'next/link';
import { FiHeart, FiLoader } from 'react-icons/fi';

const FavoritesPage = () => {
  const { favorites, loading, error } = useFavorites();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-amber-900 mb-8">Your Favorite Dishes</h1>
          <div className="flex items-center justify-center py-12">
            <FiLoader className="animate-spin text-amber-600 mr-2" size={24} />
            <span className="text-gray-600">Loading favorites...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-amber-900 mb-8">Your Favorite Dishes</h1>
          <div className="text-center py-12">
            <p className="text-red-600">Error loading favorites: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">Your Favorite Dishes</h1>

        {favorites.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {favorites.map((favorite, index) => (
              <motion.div
                key={favorite._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard
                  product={favorite.product}
                  onSelect={() => setSelectedProduct(favorite.product)}
                  showFavorite={true}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <FiHeart className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-xl text-gray-600 mb-4">You haven't added any favorites yet</p>
            <Link href="/">
              <span className="text-amber-600 hover:underline">Browse our menu</span>
            </Link>
          </div>
        )}

        {/* Product Modal */}
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </section>
  );
};

export default FavoritesPage;
