"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');

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
      
      // Use the new Paystack verification endpoint
      const response = await fetch('/api/payment/verify-paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Payment verified successfully!');
        setOrderId(data.data.order._id);
        
        // Post success message to parent window (for popup)
        if (window.opener) {
          window.opener.postMessage({
            type: 'PAYMENT_SUCCESS',
            reference: reference,
            trans: data.data.transaction?.id,
            transaction: data.data.transaction?.id,
            message: 'Payment successful',
            redirecturl: ''
          }, window.location.origin);
          window.close();
        } else {
          // Redirect to success page after 3 seconds if not in popup
          setTimeout(() => {
            router.push(`/account/orders`);
          }, 3000);
        }
      } else {
        setStatus('failed');
        setMessage(data.error || 'Payment verification failed');
        
        // Post failure message to parent window (for popup)
        if (window.opener) {
          window.opener.postMessage({
            type: 'PAYMENT_CANCELLED'
          }, window.location.origin);
          window.close();
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('An error occurred while verifying payment');
      
      // Post failure message to parent window (for popup)
      if (window.opener) {
        window.opener.postMessage({
          type: 'PAYMENT_CANCELLED'
        }, window.location.origin);
        window.close();
      }
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-green-100 text-green-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              {orderId && (
                <p className="text-sm text-gray-500 mb-2">Order ID: #{orderId}</p>
              )}
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-4">You will be redirected to your orders page shortly...</p>
              
              <div className="space-y-3">
                <Link
                  href="/account/orders"
                  className="w-full inline-block bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors"
                >
                  View My Orders
                </Link>
                <Link
                  href="/"
                  className="w-full inline-block bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
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

export default function PaymentCallbackPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}