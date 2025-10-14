'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, RegisterData } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  role: 'user' | 'admin' | 'vendor';
  businessName?: string;
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
          const response = await apiClient.getProfile();
          setUser(response.data);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
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