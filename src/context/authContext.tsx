'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, RegisterData } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  addresses?: Array<{
    _id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    type: 'home' | 'work' | 'other';
    isDefault: boolean;
    createdAt: string;
  }>;
  role: 'user' | 'admin' | 'vendor';
  businessName?: string;
  businessDescription?: string;
  businessCategory?: string;
  preferences?: {
    newsletter?: boolean;
    smsNotifications?: boolean;
    emailNotifications?: boolean;
    orderUpdates?: boolean;
    promotions?: boolean;
  };
  isEmailVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, isVendor?: boolean) => Promise<void>;
  register: (userData: RegisterData, isVendor?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set loading to true to prevent flash
          setLoading(true);
          const response = await apiClient.getProfile();
          setUser(response.data);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        // Add a small delay to ensure smooth UI transition
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }
    };

    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      initializeAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Handle API errors
  const handleError = (error: any) => {
    setError(error.message || 'An unexpected error occurred');
    console.error('Auth error:', error);
  };

  // Login function
  const login = async (email: string, password: string, isVendor: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = isVendor 
        ? await apiClient.vendorLogin({ email, password })
        : await apiClient.login({ email, password });
      
      const token = response?.token;
      
      if (!token) {
        throw new Error('No token received');
      }
      
      // Store token
      localStorage.setItem('token', token);
      
      // Fetch user data
      const userResponse = await apiClient.getProfile();
      setUser(userResponse.data);
      
      // Redirect based on role
      if (userResponse.data.role === 'vendor') {
        router.push('/vendor');
      } else if (userResponse.data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData, isVendor: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = isVendor 
        ? await apiClient.vendorRegister(userData as any)
        : await apiClient.register(userData);
      
      const token = response.data?.token;
      
      if (!token) {
        throw new Error('No token received');
      }
      
      // Store token
      localStorage.setItem('token', token);
      
      // Fetch user data
      const userResponse = await apiClient.getProfile();
      setUser(userResponse.data);
      
      // Redirect based on role
      if (userResponse.data.role === 'vendor') {
        router.push('/vendor');
      } else {
        router.push('/');
      }
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  // Update user profile
  const updateUser = async (userData: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.updateProfile(userData);
      setUser(response.data);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      register, 
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};