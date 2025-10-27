'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Store, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VendorAuthGuardProps {
  children: React.ReactNode;
}

export function VendorAuthGuard({ children }: VendorAuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return; // Still loading session
    }

    setIsChecking(false);

    if (!session) {
      // No session, show toast and redirect to vendor login
      toast.error('Please log in to access your vendor dashboard');
      router.replace('/login/vendor');
      return;
    }

    if (session.user?.role !== 'vendor') {
      // User is authenticated but not a vendor
      if (session.user?.role === 'admin') {
        toast('Redirecting to admin dashboard', { icon: 'ℹ️' });
        router.replace('/admin');
      } else {
        toast.error('Access denied. Vendor account required.');
        router.replace('/');
      }
      return;
    }

    // User is authenticated and is a vendor - allow access
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Verifying Access
          </h3>
          <p className="text-gray-600">
            Please wait while we authenticate your vendor account...
          </p>
        </motion.div>
      </div>
    );
  }

  // If not a vendor and not redirecting, show unauthorized access page
  if (session && session.user?.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
            <Store className="w-8 h-8 text-orange-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vendor Access Required
          </h2>
          
          <p className="text-gray-600 mb-6">
            This area is exclusively for restaurant vendors. Join our platform to manage your restaurant and reach more customers.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                toast.success('Redirecting to vendor registration...');
                router.push('/vendor/register');
              }}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Store className="w-4 h-4" />
              <span>Become a Vendor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                toast('Redirecting to vendor login...', { icon: '🔐' });
                router.push('/vendor/login');
              }}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Already a vendor? Sign In
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full text-gray-500 hover:text-gray-700 py-2 transition-colors text-sm"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If no session or wrong role, don't render children (will redirect)
  if (!session || session.user?.role !== 'vendor') {
    return null;
  }

  // User is authenticated as vendor, render children
  return <>{children}</>;
}