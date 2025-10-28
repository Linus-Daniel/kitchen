'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Shield, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return; // Still loading session
    }

    setIsChecking(false);

    if (!session) {
      // No session, show toast and redirect to login
      toast.error('Please log in to access the admin dashboard');
      router.replace('/login');
      return;
    }

    if (session.user?.role !== 'admin') {
      // User is authenticated but not an admin
      if (session.user?.role === 'vendor') {
        toast('Redirecting to vendor dashboard', { icon: 'ℹ️' });
        router.replace('/vendor');
      } else {
        toast.error('Access denied. Admin privileges required.');
        router.replace('/');
      }
      return;
    }

    // User is authenticated and is an admin - allow access
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
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Verifying Access
          </h3>
          <p className="text-gray-600">
            Please wait while we authenticate your admin account...
          </p>
        </motion.div>
      </div>
    );
  }

  // If not an admin and not redirecting, show unauthorized access page
  if (session && session.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Access Required
          </h2>
          
          <p className="text-gray-600 mb-6">
            This area is restricted to administrators only. Contact your system administrator for access.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                toast('Switching to regular login...', { icon: '🔐' });
                router.push('/login');
              }}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Different Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If no session or wrong role, don't render children (will redirect)
  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  // User is authenticated as admin, render children
  return <>{children}</>;
}