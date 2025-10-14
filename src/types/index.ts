// Re-export all types from separate files
export * from './api'
export * from './auth'
export * from './models'
export * from './components'
export * from './context'
export * from './vendor'

// Legacy exports for backward compatibility
import { StaticImageData } from "next/image";

export type Option = {
  name: string;
  price: number
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string | StaticImageData;
  description: string;
  rating: number;
  cookTime: string
  options: Option[]
  ingredients: string[]
  dietary?: string[]
}

export interface CartItem {
  quantity: number;
  id: string;
  name: string;
  price: number;
  category: string;
  image: string | StaticImageData;
  description: string;
  rating: number;
  cookTime: string
  options: Option[]
  ingredients: string[]
  dietary?: string[]
  selectedOption: Option | null
};

export type AddToCart = (product: CartItem, quantity: number, selectedOption: { name: string }) => void | undefined

export interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: Array<{
    product: string;
    name: string;
    price: number;
    quantity: number;
    selectedOption?: Option;
  }>;
  totalPrice: number;
  status: string;
  createdAt: string;
  isPaid: boolean;
  isDelivered: boolean
}