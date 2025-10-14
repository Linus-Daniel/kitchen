export interface VendorAnalytics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  popularProducts: Array<{
    productId: string
    name: string
    orderCount: number
    revenue: number
  }>
  revenueByDay: Array<{
    date: string
    revenue: number
    orders: number
  }>
  ordersByStatus: {
    pending: number
    confirmed: number
    preparing: number
    ready: number
    delivered: number
    cancelled: number
  }
}

export interface VendorDashboardData {
  analytics: VendorAnalytics
  recentOrders: Array<{
    _id: string
    user: {
      name: string
      email: string
    }
    orderItems: Array<{
      product: string
      name: string
      quantity: number
      price: number
    }>
    totalPrice: number
    status: string
    createdAt: string
  }>
  products: Array<{
    _id: string
    name: string
    price: number
    category: string
    image: string
    isActive: boolean
    orderCount: number
  }>
}

export interface VendorProduct {
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
  createdAt: string
  updatedAt: string
}

export interface CreateProductData {
  name: string
  description: string
  price: number
  category: string
  image: string
  cookTime: string
  options: Array<{
    name: string
    price: number
  }>
  ingredients: string[]
  dietary?: string[]
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean
}