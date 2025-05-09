import { motion } from 'framer-motion';
import ProductCard from './foodCard';
import { useState } from 'react';
import ProductModal from './ProductModal';
import { AddToCart, CartItem, Product } from '@/types';
import productDatas from '@/constants/foodData';

type Props = {
  products:Product[],
  addToCart:AddToCart
  showFavorites:boolean
  selectedCategory: string;
  searchQuery: string; 
  openCart:()=>void;
}

const StoreGrid = ({ 
  addToCart, 
  showFavorites = true 
}:Partial<Props>) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

const products = productDatas

  if (products.length === 0) {
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
    <>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {products.map((product) => (
          <ProductCard 
            key={product.id}
            product={product}
            onSelect={() => setSelectedProduct(product)}
            showFavorite={showFavorites}
          />
        ))}
      </motion.div>

      {/* Product modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={addToCart as AddToCart}
        />
      )}
    </>
  );
};

export default StoreGrid;