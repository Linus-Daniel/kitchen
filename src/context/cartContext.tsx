'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './authContext';
import axios, { AxiosError } from 'axios';
import { StaticImageData } from "next/image";

// Define types first
export type Option = {
  name: string;
  price: number;
  choice?: string; // Added based on usage in selectedOption
};

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string | StaticImageData;
  description: string;
  rating: number;
  cookTime: string;
  options: Option[];
  ingredients: string[];
  dietary?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedOption?: { name: string; choice: string }[]; // Corrected based on usage
}

export interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: CartItem[]; // Changed from empty array to CartItem[]
  totalPrice: number;
  status: string;
  createdAt: string;
  isPaid: boolean;
  isDelivered: boolean;
}

// Define the context type
interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity: number, selectedOption?: { name: string; choice: string }[]) => Promise<void>;
  removeFromCart: (productId: string, selectedOptionName?: string) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number, selectedOptionName?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

// Create context with initial null value
const CartContext = createContext<CartContextType | null>(null);

// Provider props type
interface CartProviderProps {
  children: ReactNode;
}

// Create axios instance for API calls
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load cart from backend when user logs in
  useEffect(() => {
    if (user) {
      syncCart();
    } else {
      // Clear cart when user logs out
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  }, [user]);

  // Update cart count and total price when cart items change
  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    const price = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    setCartCount(count);
    setTotalPrice(price);
    
    // Save to localStorage only if user is not logged in (guest cart)
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Handle API errors
  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      setError(error.response?.data?.message || error.message);
    } else if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unexpected error occurred');
    }
    throw error;
  };

  // Synchronize cart with backend
  const syncCart = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        withCredentials: true
      });
      const backendCart = response.data.data.items || [];
      
      // Merge local cart with backend cart if needed
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
      if (localCart.length > 0) {
        // Merge logic could be more sophisticated based on your needs
        const mergedCart = [...backendCart, ...localCart];
        await api.put('/cart', { items: mergedCart }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          withCredentials: true
        });
        localStorage.removeItem('cart');
      }

      setCartItems(backendCart);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product: Product, quantity: number = 1, selectedOption?: { name: string; choice: string }[]) => {
    setLoading(true);
    setError(null);
    
    const cartItem: CartItem = {
      ...product,
      quantity,
      selectedOption,
      price: product.price 
    };

    try {
      if (user) {
        // Authenticated user - sync with backend
        await api.post('/cart', {
          productId: product.id,
          quantity,
          selectedOption,
          price: product.price
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          withCredentials: true
        });
        await syncCart();
      } else {
        // Guest user - local storage only
        setCartItems(prevItems => {
          const existingItem = prevItems.find(
            item => item.id === product.id && 
                   JSON.stringify(item.selectedOption) === JSON.stringify(selectedOption)
          );

          if (existingItem) {
            return prevItems.map(item =>
              item.id === product.id && 
              JSON.stringify(item.selectedOption) === JSON.stringify(selectedOption)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }

          return [...prevItems, cartItem];
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string, selectedOptionName?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        // Authenticated user - sync with backend
        await api.delete(`/cart/${productId}`, {
          data: { optionName: selectedOptionName },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          withCredentials: true
        });
        await syncCart();
      } else {
        // Guest user - local storage only
        setCartItems(prevItems =>
          prevItems.filter(
            item => !(item.id === productId && 
                     (!selectedOptionName || 
                      item.selectedOption?.some(opt => opt.name === selectedOptionName)))
          )
        );
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string, newQuantity: number, selectedOptionName?: string) => {
    if (newQuantity < 1) return;

    setLoading(true);
    setError(null);
    try {
      if (user) {
        // Authenticated user - sync with backend
        await api.put(`/cart/${productId}`, {
          quantity: newQuantity,
          optionName: selectedOptionName
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          withCredentials: true
        });
        await syncCart();
      } else {
        // Guest user - local storage only
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === productId && 
            (!selectedOptionName || 
             item.selectedOption?.some(opt => opt.name === selectedOptionName))
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        // Authenticated user - sync with backend
        await api.delete('/cart', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          withCredentials: true
        });
      }
      // Clear for both authenticated and guest users
      setCartItems([]);
      localStorage.removeItem('cart');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        totalPrice,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};