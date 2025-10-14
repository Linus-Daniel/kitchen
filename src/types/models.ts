import { Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  password: string
  role: 'user' | 'admin' | 'vendor'
  businessName?: string
  isEmailVerified: boolean
  emailVerificationToken?: string
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(enteredPassword: string): Promise<boolean>
  getSignedJWTToken(): string
}

export interface IVendor extends Document {
  _id: string
  businessName: string
  ownerName: string
  email: string
  password: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  businessHours: {
    open: string
    close: string
    daysOpen: string[]
  }
  isVerified: boolean
  isActive: boolean
  rating: number
  totalOrders: number
  createdAt: Date
  updatedAt: Date
  comparePassword(enteredPassword: string): Promise<boolean>
  getSignedJWTToken(): string
}

export interface IProduct extends Document {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  vendor: string
  rating: number
  cookTime: string
  options: Array<{
    name: string
    price: number
  }>
  ingredients: string[]
  dietary?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ICart extends Document {
  _id: string
  user: string
  items: Array<{
    product: string
    quantity: number
    selectedOption?: {
      name: string
      price: number
    }
  }>
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

export interface IOrder extends Document {
  _id: string
  user: string
  vendor: string
  orderItems: Array<{
    product: string
    name: string
    price: number
    quantity: number
    selectedOption?: {
      name: string
      price: number
    }
  }>
  totalPrice: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed'
  deliveryAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  estimatedDeliveryTime?: Date
  actualDeliveryTime?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IPayment extends Document {
  _id: string
  order: string
  user: string
  amount: number
  paymentMethod: 'card' | 'cash' | 'digital_wallet'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  createdAt: Date
  updatedAt: Date
}