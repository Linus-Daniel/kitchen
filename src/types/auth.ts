export interface User {
  _id: string
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  isEmailVerified: boolean
  emailVerificationToken?: string
  resetPasswordToken?: string
  resetPasswordExpire?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Vendor {
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
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface VendorRegisterData {
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
}

export interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}

export interface VendorAuthContextType {
  vendor: Vendor | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: VendorRegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}