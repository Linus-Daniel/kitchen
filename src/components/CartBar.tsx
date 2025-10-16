"use client"
import { useCart } from '@/hooks/useCart';
import { CartItem, Product } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus } from 'react-icons/fi';

type Props = {
    isOpen: boolean;
    onClose: () => void;


  };
  

const CartSidebar = ({ isOpen, onClose }:Props) => {

  const {cartItems,addToCart,updateQuantity,removeFromCart} = useCart()
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Order</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.li 
                      key={item.id}
                      className="flex gap-4 p-2 border-b"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-16 h-16 bg-amber-50 rounded-md flex items-center justify-center">
                        <img 
                          src={item.image as string} 
                          alt={item.name}
                          className="h-12 object-contain"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                        
                        <div className="flex items-center mt-2">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-500 hover:text-amber-600"
                          >
                            <FiMinus size={14} />
                          </button>
                          
                          <span className="mx-2 w-6 text-center">{item.quantity}</span>
                          
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-amber-600"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end justify-between">
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            
            {cartItems.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span>Delivery Fee:</span>
                  <span className="font-bold">$2.99</span>
                </div>
                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total:</span>
                  <span>${(subtotal + 2.99).toFixed(2)}</span>
                </div>
                
                <motion.a
                  className="w-full bg-amber-600 flex itens-center justify-center text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  href='/checkout'
                >
                  Proceed to Checkout
                </motion.a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;