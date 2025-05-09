"use client"
import { motion } from 'framer-motion';
import { FiPlus, FiStar } from 'react-icons/fi';
import FavoriteButton from './favouriteButton';
import { Product } from '@/types';



type Props = {
  product:Product;
  onSelect:()=> void;
  showFavorite:boolean
}

const ProductCard = ({ product, onSelect, showFavorite = true }:Props) => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow relative"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onSelect}
    >
      {/* Favorite button */}
      {showFavorite && (
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton productId={product.id} />
        </div>
      )}
      
      {/* Product image */}
      <div className="h-48 bg-amber-50 flex items-center justify-center p-4 relative">
        <motion.img 
          src={product.image as string} 
          alt={product.name}
          className="h-full object-contain"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Dietary badges */}
        {product.dietary && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {product.dietary.map((diet) => (
              <span 
                key={diet}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {diet}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Product info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{product.name}</h3>
          <span className="font-bold text-amber-600">${product.price.toFixed(2)}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm">
            <FiStar className="text-amber-500 mr-1" />
            <span>{product.rating}</span>
            <span className="mx-2">•</span>
            <span>{product.cookTime}</span>
          </div>
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
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