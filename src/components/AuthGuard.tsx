"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin' | 'vendor')[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ 
  children, 
  allowedRoles = ['user', 'admin', 'vendor'],
  redirectTo = '/login',
  fallback 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'vendor':
            router.push('/vendor');
            break;
          default:
            router.push('/');
        }
        return;
      }

      setShowContent(true);
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-amber-700 animate-pulse">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!showContent) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-amber-700 animate-pulse">Redirecting...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}