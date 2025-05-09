'use client';

import { Product } from '@/types';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the Cart Item type
export interface CartItem extends Product {
  selectedOption: any;
  quantity: number;
}

// Define the context type
interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: string | number, optionName?: string) => void;
  updateQuantity: (productId: string | number, newQuantity: number, optionName?: string) => void;
  clearCart: () => void;
}

// Create context with initial null value
const CartContext = createContext<CartContextType | null>(null);

// Provider props type
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        item =>
          item.id === product.id &&
          (!product.selectedOption || item.selectedOption?.name === product.selectedOption?.name)
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id &&
          (!product.selectedOption || item.selectedOption?.name === product.selectedOption?.name)
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }

      return [...prevItems, product];
    });
  };

  const removeFromCart = (productId: string | number, optionName?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        item =>
          !(item.id === productId && (!optionName || item.selectedOption?.name === optionName))
      )
    );
  };

  const updateQuantity = (productId: string | number, newQuantity: number, optionName?: string) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.id === productId && (!optionName || item.selectedOption?.name === optionName)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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
