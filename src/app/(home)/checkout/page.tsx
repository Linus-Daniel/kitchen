"use client";
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCreditCard, FiHome, FiMapPin } from 'react-icons/fi';
import { paystackService } from '@/lib/paystack';
import { apiClient } from '@/lib/api';
import { LoadingSkeleton, CartItemSkeleton } from '@/components/ui/LoadingSkeleton';
import { showToast } from '@/lib/toast';
import Link from 'next/link';

type DeliveryOption = 'delivery' | 'pickup';
type PaymentMethod = 'paystack' | 'cash';

interface ShippingAddress {
  street: string;
  apartment: string;
  city: string;
  zipCode: string;
}

const CheckoutPage = () => {
  const { cartItems, cartCount, removeFromCart, updateQuantity, clearCart, loading: cartLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    apartment: '',
    city: '',
    zipCode: ''
  });

  const subtotal = cartItems.reduce(
    (sum: number, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = deliveryOption === 'delivery' ? 2.99 : 0;
  const taxPrice = subtotal * 0.075; // 7.5% tax
  const total = subtotal + deliveryFee + taxPrice;

  const handlePlaceOrder = async () => {
    if (!user) {
      setError('Please log in to place an order');
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      setError('Please fill in all required shipping address fields');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      if (paymentMethod === 'paystack') {
        // For Paystack: Create order first, then initiate payment
        try {
          const orderData = {
            shippingAddress: {
              street: `${shippingAddress.street}${shippingAddress.apartment ? ', ' + shippingAddress.apartment : ''}`,
              city: shippingAddress.city,
              state: 'Lagos', // Default state
              zipCode: shippingAddress.zipCode
            },
            paymentMethod: 'Paystack',
            itemsPrice: subtotal,
            taxPrice,
            shippingPrice: deliveryFee,
            totalPrice: total,
            specialInstructions: '',
          };

          const orderResponse = await apiClient.createOrder(orderData);
          const createdOrder = orderResponse.data;
          setOrderId(createdOrder._id);

          // Initialize Paystack payment
          const initResponse = await fetch('/api/payment/initialize-paystack', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              orderId: createdOrder._id,
              amount: total,
              email: user.email,
              metadata: {
                customerName: user.name,
                customerPhone: user.phone,
              },
            }),
          });

          const initData = await initResponse.json();
          
          if (!initResponse.ok) {
            throw new Error(initData.message || 'Payment initialization failed');
          }

          // Use Paystack popup for payment
          await paystackService.initializePayment({
            amount: total,
            email: user.email || '',
            orderId: createdOrder._id,
            customerName: user.name,
            onSuccess: async (response) => {
              try {
                // Verify payment after successful payment
                const verifyResponse = await fetch('/api/payment/verify-paystack', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  },
                  body: JSON.stringify({ 
                    reference: response.reference,
                    orderId: createdOrder._id 
                  }),
                });

                const verifyData = await verifyResponse.json();
                
                if (!verifyResponse.ok) {
                  throw new Error(verifyData.message || 'Payment verification failed');
                }
                
                // Order and payment successful - cart is cleared in verify endpoint
                clearCart(); // Update frontend cart state
                showToast.success('Payment successful! Your order has been placed.');
                setOrderSuccess(true);
              } catch (verifyError) {
                setError('Payment verification failed. Please contact support.');
                console.error('Payment verification error:', verifyError);
              }
            },
            onCancel: () => {
              setError('Payment was cancelled');
              setIsProcessing(false);
            }
          });
        } catch (paymentError) {
          setError(paymentError instanceof Error ? paymentError.message : 'Payment initialization failed');
          setIsProcessing(false);
        }
      } else {
        // Cash on delivery: Create order directly
        const orderData = {
          shippingAddress: {
            street: `${shippingAddress.street}${shippingAddress.apartment ? ', ' + shippingAddress.apartment : ''}`,
            city: shippingAddress.city,
            state: 'Lagos', // Default state
            zipCode: shippingAddress.zipCode
          },
          paymentMethod: 'Cash on Delivery',
          itemsPrice: subtotal,
          taxPrice,
          shippingPrice: deliveryFee,
          totalPrice: total,
          specialInstructions: '',
        };

        const orderResponse = await apiClient.createOrder(orderData);
        const createdOrder = orderResponse.data;
        setOrderId(createdOrder._id);
        
        // Cart cleared server-side for cash on delivery orders
        clearCart(); // Update frontend cart state
        showToast.success('Order placed successfully! You can pay cash on delivery.');
        setOrderSuccess(true);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to place order';
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error('Order creation error:', err);
    }

    setIsProcessing(false);
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
          {orderId && (
            <p className="text-sm text-gray-500 mb-2">Order ID: #{orderId}</p>
          )}
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Thank you for your order. Your food is being prepared and will be delivered soon.
            {paymentMethod === 'paystack' ? ' Your payment has been processed securely.' : ' You can pay cash when your order arrives.'}
          </p>
          
          <Link href="/" legacyBehavior>
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

  // Show loading state
  if (authLoading || cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <LoadingSkeleton height={24} width="40%" className="mb-4" />
              <div className="grid grid-cols-2 gap-4 mb-6">
                <LoadingSkeleton height={80} />
                <LoadingSkeleton height={80} />
              </div>
              <div className="space-y-4">
                <LoadingSkeleton height={48} />
                <LoadingSkeleton height={48} />
                <div className="grid grid-cols-2 gap-4">
                  <LoadingSkeleton height={48} />
                  <LoadingSkeleton height={48} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <LoadingSkeleton height={24} width="40%" className="mb-4" />
              <div className="space-y-3">
                <LoadingSkeleton height={64} />
                <LoadingSkeleton height={64} />
              </div>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <LoadingSkeleton height={24} width="50%" className="mb-4" />
              <div className="space-y-4 mb-6">
                {[...Array(3)].map((_, i) => (
                  <CartItemSkeleton key={i} />
                ))}
              </div>
              <div className="space-y-2 border-t border-gray-200 pt-4 mb-6">
                <LoadingSkeleton height={20} />
                <LoadingSkeleton height={20} />
                <LoadingSkeleton height={20} />
                <LoadingSkeleton height={24} />
              </div>
              <LoadingSkeleton height={48} />
            </div>
          </div>
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
          
          <Link href="/" legacyBehavior>
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
        <Link href="/" legacyBehavior>
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
                  placeholder="Street Address *"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={shippingAddress.apartment}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, apartment: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City *"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code *"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
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
                  onClick={() => setPaymentMethod('paystack')}
                  className={`w-full p-4 border rounded-lg text-left flex items-center ${
                    paymentMethod === 'paystack'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-3">
                    💳
                  </div>
                  <div>
                    <div className="font-medium">Paystack</div>
                    <div className="text-sm text-gray-500">Pay securely with debit/credit card, bank transfer, or USSD</div>
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
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                    💵
                  </div>
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay when you receive your order</div>
                  </div>
                </button>
              </div>
              
              {paymentMethod === 'paystack' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-2">
                      🔒
                    </div>
                    <div className="text-sm text-green-700">
                      Secure payment powered by Paystack. You'll be redirected to complete your payment safely.
                    </div>
                  </div>
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
                  <div key={`${item.id}-${item.selectedOption?.map(opt => opt.name).join('-') || 'default'}`} className="flex justify-between">
                    <div>
                      <div className="font-medium">
                        {item.quantity} × {item.name}
                      </div>
                      {item.selectedOption && item.selectedOption.length > 0 && (
                        <div className="text-sm text-gray-500">
                          {item.selectedOption.map(opt => `${opt.name}`)}
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
                  <span>Tax (7.5%)</span>
                  <span>${taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {!user && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg text-sm">
                  Please <Link href="/login" className="underline font-medium">login</Link> to place an order.
                </div>
              )}
              
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