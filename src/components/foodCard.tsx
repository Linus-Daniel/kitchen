"use client"
import { Product } from '@/types';
import { motion } from 'framer-motion';
import { FiPlus, FiStar } from 'react-icons/fi';

type Props = {
    product:Product;
    addToCart:(product:Product)=>void
}

const ProductCard = ({ product, addToCart }:Props) => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-48 bg-amber-50 flex items-center justify-center">
        <motion.img 
          src={product.image as string} 
          alt={product.name}
          className="h-full object-cover w-full"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{product.name}</h3>
          <span className="font-bold text-amber-600">${product.price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm">
            <FiStar className="text-amber-500 mr-1" />
            <span>{product.rating}</span>
            <span className="mx-2">•</span>
            <span>{product.cookTime}</span>
          </div>
          
          <motion.button
            onClick={() => addToCart(product)}
            className="bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiPlus />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;