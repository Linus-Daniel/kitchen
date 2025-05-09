"use client"
import { useState } from 'react';
import { useCart } from '@/context/cartContext';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCreditCard, FiHome, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';

const CheckoutPage = () => {
  const { cartItems, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const [deliveryOption, setDeliveryOption] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const subtotal = cartItems.reduce(
    (sum:any, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = deliveryOption === 'delivery' ? 2.99 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setOrderSuccess(true);
      clearCart();
    }, 2000);
  };

  if (orderSuccess) {
    return (
      <div>
        <div className="container mx-auto px-4 py-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-100 text-green-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Thank you for your order. Your food is being prepared and will be delivered soon.
          </p>
          
          <Link href="/store">
            <motion.a
              className="inline-block bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-amber-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Menu
            </motion.a>
          </Link>
        </div>
      </div>
    );
  }

  if (cartCount === 0 && !orderSuccess) {
    return (
      <div>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          
          <Link href="/store">
            <motion.a
              className="inline-block bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-amber-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Browse Menu
            </motion.a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <Link href="/store">
          <motion.a 
            className="flex items-center text-amber-600 hover:text-amber-700 mb-6"
            whileHover={{ x: -3 }}
          >
            <FiArrowLeft className="mr-2" />
            Back to Menu
          </motion.a>
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left column - Delivery and Payment */}
          <div className="md:col-span-2 space-y-8">
            {/* Delivery options */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FiMapPin className="mr-2 text-amber-600" />
                Delivery Options
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setDeliveryOption('delivery')}
                  className={`p-4 border rounded-lg text-left ${
                    deliveryOption === 'delivery'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="font-medium">Delivery</div>
                  <div className="text-sm text-gray-500">$2.99 delivery fee</div>
                </button>
                
                <button
                  onClick={() => setDeliveryOption('pickup')}
                  className={`p-4 border rounded-lg text-left ${
                    deliveryOption === 'pickup'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="font-medium">Pickup</div>
                  <div className="text-sm text-gray-500">Free, ready in 20-30 min</div>
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Delivery Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Payment methods */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FiCreditCard className="mr-2 text-amber-600" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 border rounded-lg text-left flex items-center ${
                    paymentMethod === 'card'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                    💳
                  </div>
                  <div>
                    <div className="font-medium">Credit/Debit Card</div>
                    <div className="text-sm text-gray-500">Pay with Visa, Mastercard, etc.</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`w-full p-4 border rounded-lg text-left flex items-center ${
                    paymentMethod === 'paypal'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M7.3 17.9h-1.5c-.1 0-.2 0-.2-.1l-1.2-7.6c0-.1 0-.2.1-.2h1.7c.1 0 .2 0 .2.1l.6 3.8c.1.6.3 1.2.6 1.6 1 .9 2.4 1.4 4 1.4zm13.3-7.8l-1.2 7.6c0 .1-.1.1-.2.1h-1.2c-.1 0-.2 0-.2-.1l-.7-4.5-.1-.4c-.4.5-1 .8-1.7.8h-3.1l-.2 1.3c0 .1-.1.1-.2.1H9.7c-.1 0-.2 0-.2-.1l-.7-4.5v-.2l-1-6.4c0-.1 0-.2.1-.2h2.9c.1 0 .2 0 .2.1l.7 4.5c.1.6.3 1.2.6 1.6 1 .9 1 1.4 2.3 1.4 3.9h1.9c.1 0 .2 0 .2-.1l.7-4.5c0-.1.1-.1.2-.1z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">PayPal</div>
                    <div className="text-sm text-gray-500">Pay with your PayPal account</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-4 border rounded-lg text-left flex items-center ${
                    paymentMethod === 'cash'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-3">
                    💵
                  </div>
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay when you receive your order</div>
                  </div>
                </button>
              </div>
              
              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Name on Card"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Right column - Order summary */}
          <div>
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6 sticky top-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedOption?.name || 'default'}`} className="flex justify-between">
                    <div>
                      <div className="font-medium">
                        {item.quantity} × {item.name}
                      </div>
                      {item.selectedOption && (
                        <div className="text-sm text-gray-500">
                          {item.selectedOption.name}
                        </div>
                      )}
                    </div>
                    <div className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <motion.button
                onClick={handlePlaceOrder}
                className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-700 transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </motion.button>
              
              <p className="text-xs text-gray-500 mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;