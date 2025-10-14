"use client";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./foodCard";
import { useState, useEffect } from "react";
import ProductModal from "./ProductModal";
import { AddToCart } from "@/types";
import { useProducts, Product } from "@/hooks/useProducts";

type Props = {
  addToCart: AddToCart;
  showFavorites: boolean;
  selectedCategory: string;
  searchQuery: string;
  openCart: () => void;
  filterOptions?: {
    priceRange: [number, number];
    dietary: string[];
    rating: number;
    deliveryTime: number;
  };
};

const StoreGrid = ({
  addToCart,
  showFavorites = true,
  selectedCategory,
  searchQuery,
  filterOptions,
}: Partial<Props>) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { 
    products, 
    loading, 
    error, 
    pagination,
    updateFilters 
  } = useProducts({
    page: 1,
    limit: 20,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    search: searchQuery || undefined,
    minPrice: filterOptions?.priceRange[0],
    maxPrice: filterOptions?.priceRange[1],
    minRating: filterOptions?.rating || undefined,
  });

  useEffect(() => {
    updateFilters({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchQuery || undefined,
      minPrice: filterOptions?.priceRange[0],
      maxPrice: filterOptions?.priceRange[1],
      minRating: filterOptions?.rating || undefined,
    });
  }, [selectedCategory, searchQuery, filterOptions, updateFilters]);

  if (loading) {
    return (
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
          >
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-medium text-red-600 mb-2">
          Error loading products
        </h3>
        <p className="text-gray-500">{error}</p>
      </motion.div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        className="text-center py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-medium text-gray-600 mb-2">
          No food found
        </h3>
        <p className="text-gray-500">Try different search or category</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProductCard
              product={product}
              onSelect={() => setSelectedProduct(product)}
              showFavorite={showFavorites}
            />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default StoreGrid;
