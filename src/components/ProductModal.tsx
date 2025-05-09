"use client"
import { AddToCart, CartItem, Option, Product } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiX, FiStar, FiClock, FiPlus, FiMinus } from 'react-icons/fi';

type Props = {
  product:Product,
  isOpen:boolean;
  onClose:()=>void
  addToCart:AddToCart

}

const ProductModal = ({ product, isOpen, onClose, addToCart }:Props) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<Option| null>(null);

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      selectedOption: product.options ? selectedOption : null
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <div 
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Product image */}
                <div className="bg-amber-50 h-full md:h-full flex items-center justify-center">
                  <motion.img 
                    src={product.image as string} 
                    alt={product.name}
                    className="h-full object-cover w-full"
                    whileHover={{ scale: 1.05 }}
                  />
                </div>
                
                {/* Product details */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center text-amber-500 mr-4">
                      <FiStar className="mr-1" />
                      <span>{product.rating}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FiClock className="mr-1" />
                      <span>{product.cookTime}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6">{product.description}</p>
                  
                  {/* Dietary info */}
                  {product.dietary && (
                    <div className="flex flex-wrap gap-2 mb-6">
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
                  
                  {/* Options */}
                  {product.options && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Options</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {product.options.map((option) => (
                          <button
                            key={option.name}
                            className={`p-2 border rounded-lg text-sm ${
                              selectedOption?.name === option.name
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-gray-200 hover:border-amber-300'
                            }`}
                            onClick={() => setSelectedOption(option)}
                          >
                            <div className="font-medium">{option.name}</div>
                            {option.price && (
                              <div className="text-amber-600">+${option.price.toFixed(2)}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Quantity selector */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center border rounded-full">
                      <button 
                        className="p-2 text-gray-500 hover:text-amber-600"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <FiMinus />
                      </button>
                      <span className="px-4">{quantity}</span>
                      <button 
                        className="p-2 text-gray-500 hover:text-amber-600"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <FiPlus />
                      </button>
                    </div>
                    
                    <div className="text-2xl font-bold text-amber-600">
                      ${(
                        product.price + 
                        (selectedOption?.price || 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Add to cart button */}
                  <motion.button
                    className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleAddToCart}
                    disabled={product.options && !selectedOption}
                  >
                    Add to Cart - ${(
                      (product.price + (selectedOption?.price || 0)) * quantity
                    ).toFixed(2)}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;