import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
  token:string;
  total?: number;
  filters?: any;
  unreadCount?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProductFilters extends PaginationParams {
  search?: string;
  category?: string;
  vendor?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  dietary?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface VendorRegisterData {
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  description?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  cuisineType?: string[];
}

export interface CartItemData {
  productId: string;
  quantity: number;
  selectedOptions?: Array<{ name: string; choice: string }>;
}

export interface OrderData {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface ReviewData {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
}

// Create axios instance with default configuration
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.request(config);
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'An error occurred');
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string }>> {
    return this.request({
      method: 'POST',
      url: '/login',
      data: credentials,
    });
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ token: string }>> {
    return this.request({
      method: 'POST',
      url: '/register',
      data: userData,
    });
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/me',
    });
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: '/settings',
      data,
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: '/settings/change-password',
      data,
    });
  }

  // Vendor authentication
  async vendorLogin(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; role: string }>> {
    return this.request({
      method: 'POST',
      url: '/vendors/login',
      data: credentials,
    });
  }

  async vendorRegister(vendorData: VendorRegisterData): Promise<ApiResponse<{ token: string; role: string }>> {
    return this.request({
      method: 'POST',
      url: '/vendors/register',
      data: vendorData,
    });
  }

  // Product endpoints
  async getProducts(filters?: ProductFilters): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request({
      method: 'GET',
      url: `/products?${params.toString()}`,
    });
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: `/products/${id}`,
    });
  }

  async createProduct(productData: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/products',
      data: productData,
    });
  }

  async updateProduct(id: string, productData: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/products/${id}`,
      data: productData,
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/products/${id}`,
    });
  }

  // Cart endpoints
  async getCart(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/cart',
    });
  }

  async addToCart(item: CartItemData): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/cart',
      data: item,
    });
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/cart/items/${itemId}`,
      data: { quantity },
    });
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/cart/items/${itemId}`,
    });
  }

  async clearCart(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: '/cart',
    });
  }

  // Order endpoints
  async getOrders(filters?: PaginationParams & { status?: string }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request({
      method: 'GET',
      url: `/orders?${params.toString()}`,
    });
  }

  async getOrder(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: `/orders/${id}`,
    });
  }

  async createOrder(orderData: OrderData): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/orders',
      data: orderData,
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/orders/${id}`,
      data: { orderStatus: status },
    });
  }

  // Payment endpoints
  async initializePayment(data: { orderId: string; email: string }): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/payment/initialize',
      data,
    });
  }

  async verifyPayment(data: { reference: string; orderId: string }): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/payment/verify',
      data,
    });
  }

  // Favorites endpoints
  async getFavorites(pagination?: PaginationParams): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request({
      method: 'GET',
      url: `/favorites?${params.toString()}`,
    });
  }

  async addToFavorites(productId: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/favorites',
      data: { productId },
    });
  }

  async removeFromFavorites(productId: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/favorites/${productId}`,
    });
  }

  async checkFavorite(productId: string): Promise<ApiResponse<{ isFavorite: boolean }>> {
    return this.request({
      method: 'GET',
      url: `/favorites/${productId}`,
    });
  }

  // Reviews endpoints
  async getReviews(filters?: { productId?: string; vendorId?: string } & PaginationParams): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request({
      method: 'GET',
      url: `/reviews?${params.toString()}`,
    });
  }

  async createReview(reviewData: ReviewData): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/reviews',
      data: reviewData,
    });
  }

  // Notifications endpoints
  async getNotifications(filters?: PaginationParams & { isRead?: boolean; type?: string }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request({
      method: 'GET',
      url: `/notifications?${params.toString()}`,
    });
  }

  async markNotificationRead(id: string, isRead: boolean = true): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/notifications/${id}`,
      data: { isRead },
    });
  }

  async markAllNotificationsRead(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: '/notifications/mark-all-read',
    });
  }

  async deleteNotification(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/notifications/${id}`,
    });
  }

  // Search endpoint
  async search(query: string, type?: string, pagination?: PaginationParams): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request({
      method: 'GET',
      url: `/search?${params.toString()}`,
    });
  }

  // Blog endpoints
  async getBlogs(filters?: PaginationParams & { category?: string; search?: string }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request({
      method: 'GET',
      url: `/blogs?${params.toString()}`,
    });
  }

  async getBlog(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: `/blogs/${id}`,
    });
  }

  async createBlog(blogData: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url: '/blogs',
      data: blogData,
    });
  }

  async updateBlog(id: string, blogData: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/blogs/${id}`,
      data: blogData,
    });
  }

  async deleteBlog(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/blogs/${id}`,
    });
  }

  // File upload endpoint
  async uploadFile(file: File, type: string = 'general'): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request({
      method: 'POST',
      url: '/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Vendor-specific endpoints
  async getVendors(): Promise<ApiResponse<any[]>> {
    return this.request({
      method: 'GET',
      url: '/vendors',
    });
  }

  async getVendorProfile(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/vendors/profile',
    });
  }

  async updateVendorProfile(data: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: '/vendors/profile',
      data,
    });
  }

  async getVendorProducts(): Promise<ApiResponse<any[]>> {
    return this.request({
      method: 'GET',
      url: '/vendors/products',
    });
  }

  async getVendorOrders(filters?: PaginationParams & { status?: string }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request({
      method: 'GET',
      url: `/vendors/orders?${params.toString()}`,
    });
  }

  async updateVendorOrderStatus(orderId: string, status: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/vendors/orders/${orderId}`,
      data: { status },
    });
  }

  async getVendorAnalytics(period?: string): Promise<ApiResponse<any>> {
    const params = period ? `?period=${period}` : '';
    return this.request({
      method: 'GET',
      url: `/vendors/analytics${params}`,
    });
  }

  // Admin endpoints
  async getAdminDashboard(period?: string): Promise<ApiResponse<any>> {
    const params = period ? `?period=${period}` : '';
    return this.request({
      method: 'GET',
      url: `/admin/dashboard${params}`,
    });
  }

  async getUsers(filters?: PaginationParams & { search?: string; role?: string }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request({
      method: 'GET',
      url: `/admin/users?${params.toString()}`,
    });
  }

  async getUser(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: `/admin/users/${id}`,
    });
  }

  async updateUser(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url: `/admin/users/${id}`,
      data,
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url: `/admin/users/${id}`,
    });
  }

  // Generic HTTP methods
  async get(url: string, params?: any): Promise<ApiResponse<any>> {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const fullUrl = queryParams ? `${url}?${queryParams}` : url;
    
    return this.request({
      method: 'GET',
      url: fullUrl,
    });
  }

  async post(url: string, data?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'POST',
      url,
      data,
    });
  }

  async put(url: string, data?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PUT',
      url,
      data,
    });
  }

  async patch(url: string, data?: any): Promise<ApiResponse<any>> {
    return this.request({
      method: 'PATCH',
      url,
      data,
    });
  }

  async delete(url: string): Promise<ApiResponse<any>> {
    return this.request({
      method: 'DELETE',
      url,
    });
  }

  // Missing specific methods
  async getCategories(): Promise<ApiResponse<any[]>> {
    return this.request({
      method: 'GET',
      url: '/categories',
    });
  }

  async getProductReviews(productId: string, pagination?: PaginationParams): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({ productId });
    if (pagination) {
      Object.entries(pagination).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request({
      method: 'GET',
      url: `/reviews?${params.toString()}`,
    });
  }

  async addFavorite(productId: string): Promise<ApiResponse<any>> {
    return this.addToFavorites(productId);
  }

  async removeFavorite(productId: string): Promise<ApiResponse<any>> {
    return this.removeFromFavorites(productId);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;