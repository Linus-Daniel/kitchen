"use client"
import { motion } from 'framer-motion';
import ProductCard from './foodCard';
import { products } from '@/constants/foodData';
import { Product } from '@/types';


type Props = {
    selectedCategory:string;
    searchQuery:string;
    addToCart:(product:Product) => void
    openCart:()=>void
}

const StoreGrid = ({ selectedCategory, searchQuery, addToCart }:Props) => {
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-medium text-gray-600">No products found</h3>
        <p className="text-gray-500">Try adjusting your search or filter</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {filteredProducts.map((product, index) => (
        <ProductCard 
          key={product.id}
          product={product}
          addToCart={addToCart}
        />
      ))}
    </motion.div>
  );
};

export default StoreGrid;