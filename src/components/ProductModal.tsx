"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiStar, FiClock, FiPlus, FiMinus, FiHeart } from "react-icons/fi";
import { AddToCart, Option } from "@/types";
import { Product } from "@/hooks/useProducts";
import { useState } from "react";
import { useCart } from "@/context/cartContext";

type Props = {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
};

const ProductModal = ({ product, isOpen, onClose }: Props) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Convert new Product interface to old Product interface for cart
    const cartProduct = {
      ...product,
      id: product._id, // Add id field for cart compatibility
    };
    
    addToCart(
      cartProduct as any,
      quantity,
      selectedOption
        ? [{ name: selectedOption.name, price: selectedOption.price }]
        : []
    );
    onClose();
    setQuantity(1);
    setSelectedOption(null);
  };

  const totalPrice = (product.price + (selectedOption?.price || 0)) * quantity;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Container - Responsive */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header with close button - Mobile first */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX size={24} />
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors">
                  <FiHeart size={20} />
                </button>
              </div>

              {/* Content - Responsive layout */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col lg:flex-row">
                  {/* Product Image - Responsive sizing */}
                  <div className="lg:w-1/2 xl:w-2/5">
                    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 p-6 lg:p-8">
                      <motion.img
                        src={product.images?.[0] || '/placeholder-food.jpg'}
                        alt={product.name}
                        className="w-full h-64 sm:h-80 lg:h-96 object-contain"
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                      />

                      {/* Rating and cook time overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
                            <FiStar className="text-amber-500 mr-1" />
                            <span className="font-semibold">
                              {product.rating}
                            </span>
                          </div>
                          <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
                            <FiClock className="text-gray-600 mr-1" />
                            <span>{product.cookTime || '30 min'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details - Responsive padding */}
                  <div className="lg:w-1/2 xl:w-3/5 p-6 lg:p-8">
                    {/* Product Header */}
                    <div className="mb-6">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                        {product.name}
                      </h2>
                      <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-3xl sm:text-4xl font-bold text-amber-600">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Dietary Info */}
                    {product.dietary && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {product.dietary.map((diet) => (
                          <span
                            key={diet}
                            className="px-3 py-2 bg-green-100 text-green-800 text-sm rounded-full font-medium"
                          >
                            {diet}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Options */}
                    {product.options && product.options.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-900 text-lg mb-4">
                          Choose Options
                        </h4>
                        <div className="space-y-4">
                          {product.options.map((option) => (
                            <div key={option.name}>
                              <h5 className="font-medium text-gray-800 mb-2">{option.name}</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {option.choices.map((choice) => {
                                  const optionChoice = { name: `${option.name}: ${choice}`, price: 0 };
                                  return (
                                    <motion.button
                                      key={choice}
                                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                                        selectedOption?.name === optionChoice.name
                                          ? "border-amber-500 bg-amber-50 shadow-md"
                                          : "border-gray-200 hover:border-amber-300 hover:shadow-sm"
                                      }`}
                                      onClick={() => setSelectedOption(optionChoice)}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <span className="font-medium text-gray-900 text-sm">
                                        {choice}
                                      </span>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-gray-900 text-lg">
                            Quantity
                          </span>
                          <div className="flex items-center space-x-4 bg-white rounded-full px-6 py-3 border border-gray-200 shadow-sm">
                            <button
                              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600"
                              onClick={() =>
                                setQuantity(Math.max(1, quantity - 1))
                              }
                            >
                              <FiMinus size={18} />
                            </button>
                            <span className="font-bold text-xl min-w-8 text-center">
                              {quantity}
                            </span>
                            <button
                              className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors"
                              onClick={() => setQuantity(quantity + 1)}
                            >
                              <FiPlus size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="text-center sm:text-right">
                          <div className="text-sm text-gray-600 mb-1">
                            Total
                          </div>
                          <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                            ${totalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      className="w-full bg-amber-600 text-white py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl shadow-lg shadow-amber-200 hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      disabled={
                        product.options &&
                        product.options.length > 0 &&
                        !selectedOption
                      }
                    >
                      Add to Cart - ${totalPrice.toFixed(2)}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
