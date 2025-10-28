"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import Lottie from 'lottie-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');

  const triggerConfetti = () => {
    // Multiple confetti bursts
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  // Simple success animation data for Lottie
  const successAnimationData = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Success",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Checkmark",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [0] },
              { t: 30, s: [120] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ind: 0,
                ty: "sh",
                ks: {
                  a: 0,
                  k: {
                    i: [[0, 0], [0, 0], [0, 0]],
                    o: [[0, 0], [0, 0], [0, 0]],
                    v: [[-20, 0], [-5, 15], [20, -15]],
                    c: false
                  }
                }
              },
              {
                ty: "st",
                c: { a: 0, k: [0.2, 0.8, 0.2, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 8 },
                lc: 2,
                lj: 2
              }
            ]
          }
        ],
        ip: 0,
        op: 60,
        st: 0,
        bm: 0
      }
    ]
  };

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    
    // Paystack sends reference as 'trxref' in the callback URL
    const paymentReference = reference || trxref;

    if (paymentReference) {
      verifyPayment(paymentReference);
    } else {
      setStatus('failed');
      setMessage('No payment reference found');
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      setStatus('verifying');
      
      // Use the Paystack verification endpoint
      const response = await fetch('/api/payment/verify-paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Order received and payment successful!');
        setOrderId(data.data.order._id);
        
        // Clear cart after successful payment
        localStorage.removeItem('cart');
        
        // Trigger confetti animation
        triggerConfetti();
        
        // Notify original tab about successful payment
        sessionStorage.setItem('paystack_payment_result', JSON.stringify({
          success: true,
          reference: reference,
          transaction_id: data.data.transaction?.id,
          order_id: data.data.order._id
        }));
        
        // Trigger storage event for cross-tab communication
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'paystack_payment_result',
          newValue: sessionStorage.getItem('paystack_payment_result')
        }));
        
      } else {
        setStatus('failed');
        setMessage(data.error || 'Payment verification failed');
        
        // Notify original tab about failed payment
        sessionStorage.setItem('paystack_payment_result', JSON.stringify({
          success: false,
          reference: reference
        }));
        
        // Trigger storage event for cross-tab communication
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'paystack_payment_result',
          newValue: sessionStorage.getItem('paystack_payment_result')
        }));
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('An error occurred while verifying payment');
      
      // Notify original tab about failed payment
      sessionStorage.setItem('paystack_payment_result', JSON.stringify({
        success: false,
        reference: reference || 'unknown'
      }));
      
      // Trigger storage event for cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'paystack_payment_result',
        newValue: sessionStorage.getItem('paystack_payment_result')
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center"
        >
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-32 h-32 mx-auto mb-6"
              >
                <Lottie 
                  animationData={successAnimationData}
                  loop={false}
                  className="w-full h-full"
                />
              </motion.div>
              
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl font-bold text-gray-900 mb-3"
              >
                🎉 Order Received!
              </motion.h2>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mb-6"
              >
                {orderId && (
                  <p className="text-lg text-green-600 font-semibold mb-2">Order ID: #{orderId}</p>
                )}
                <p className="text-gray-600 text-lg">{message}</p>
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">✅ Payment Successful</p>
                  <p className="text-green-700 text-sm mt-1">Your order is being prepared!</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-3"
              >
                <Link
                  href="/"
                  className="w-full inline-block bg-amber-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-amber-700 transition-colors text-lg"
                >
                  🛒 Keep Shopping
                </Link>
                <Link
                  href="/account/orders"
                  className="w-full inline-block bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  View My Orders
                </Link>
              </motion.div>
            </>
          )}

          {status === 'failed' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-red-100 text-red-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full inline-block bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors"
                >
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="w-full inline-block bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </>
          )}
        </motion.div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            If you continue to experience issues, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}