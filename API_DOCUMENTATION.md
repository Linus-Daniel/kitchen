# Kitchen Mode API Documentation

## Overview
This document provides a comprehensive overview of all API endpoints in the Kitchen Mode food delivery application.

## Color Scheme
The application uses a modern food-focused color palette:
- **Primary**: Vibrant Orange (`oklch(0.65 0.18 45.2)`) - Food/Warmth
- **Secondary**: Deep Teal (`oklch(0.55 0.08 192.17)`) - Trust/Professional  
- **Accent**: Fresh Green (`oklch(0.62 0.15 142.5)`) - Success/Fresh

Custom CSS classes available:
- `.bg-primary-gradient`, `.bg-secondary-gradient`, `.bg-accent-gradient`
- Status classes: `.status-pending`, `.status-confirmed`, etc.
- Food-specific colors: `.bg-food-orange`, `.text-food-green`, etc.

## Authentication Endpoints

### POST `/api/register`
Register a new user account
- **Body**: `{ name, email, password, phone }`
- **Returns**: `{ success, token }`

### POST `/api/login`
Login existing user
- **Body**: `{ email, password }`
- **Returns**: `{ success, token }`

### GET `/api/me`
Get current user profile
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, data: user }`

## User Management

### GET `/api/settings`
Get user settings and profile
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, data: settings }`

### PUT `/api/settings`
Update user settings
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ name, email, phone, address, ... }`
- **Returns**: `{ success, data: updatedUser }`

### PUT `/api/settings/change-password`
Change user password
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ currentPassword, newPassword }`
- **Returns**: `{ success, message }`

## Product Management

### GET `/api/products`
Get products with filtering and pagination
- **Query Params**: 
  - `page`, `limit`, `search`, `category`, `vendor`
  - `minPrice`, `maxPrice`, `minRating`
  - `sortBy`, `sortOrder`
- **Returns**: `{ success, data: products, filters, count, total }`

### GET `/api/products/[id]`
Get single product details
- **Returns**: `{ success, data: product }`

### POST `/api/products` (Vendor Only)
Create new product
- **Headers**: `Authorization: Bearer <vendor_token>`
- **Body**: `{ name, price, category, description, image, ... }`
- **Returns**: `{ success, data: product }`

### PUT `/api/products/[id]` (Vendor Only)
Update product
- **Headers**: `Authorization: Bearer <vendor_token>`
- **Body**: `{ name, price, description, ... }`
- **Returns**: `{ success, data: product }`

### DELETE `/api/products/[id]` (Vendor Only)
Delete product
- **Headers**: `Authorization: Bearer <vendor_token>`
- **Returns**: `{ success, message }`

## Cart Management

### GET `/api/cart`
Get user's cart
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, data: cart }`

### POST `/api/cart`
Add item to cart
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ productId, quantity, selectedOptions }`
- **Returns**: `{ success, data: cart }`

### DELETE `/api/cart`
Clear entire cart
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, data: cart }`

### PUT `/api/cart/items/[itemId]`
Update cart item quantity
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ quantity }`
- **Returns**: `{ success, data: cart }`

### DELETE `/api/cart/items/[itemId]`
Remove item from cart
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, data: cart }`

## Order Management

### GET `/api/orders`
Get user's orders
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `page`, `limit`, `status`
- **Returns**: `{ success, data: orders, count, total }`

### POST `/api/orders`
Create new order from cart
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ shippingAddress, paymentMethod, itemsPrice, taxPrice, ... }`
- **Returns**: `{ success, data: order }`

### GET `/api/orders/[id]`
Get single order details
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, data: order }`

### PUT `/api/orders/[id]`
Update order status (cancel only for users)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ orderStatus }`
- **Returns**: `{ success, data: order }`

## Vendor Endpoints

### POST `/api/vendors/register`
Register new vendor
- **Body**: `{ businessName, ownerName, email, password, phone, ... }`
- **Returns**: `{ success, token, role: "vendor" }`

### POST `/api/vendors/login`
Vendor login
- **Body**: `{ email, password }`
- **Returns**: `{ success, token, role: "vendor" }`

### GET `/api/vendors/profile`
Get vendor profile
- **Headers**: `Authorization: Bearer <vendor_token>`
- **Returns**: `{ success, data: vendor }`

### PUT `/api/vendors/profile`
Update vendor profile
- **Headers**: `Authorization: Bearer <vendor_token>`
- **Body**: `{ businessName, description, address, ... }`
- **Returns**: `{ success, data: vendor }`

### GET `/api/vendors/products`
Get vendor's products
- **Headers**: `Authorization: Bearer <vendor_token>`
- **Returns**: `{ success, data: products }`

### GET `/api/vendors/orders`
Get vendor's orders
- **Headers**: `Authorization: Bearer <vendor_token>`
- **Query Params**: `page`, `limit`, `status`
- **Returns**: `{ success, data: orders }`

### PUT `/api/vendors/orders/[id]`
Update vendor order status
- **Headers**: `Authorization: Bearer <vendor_token>`
- **Body**: `{ status }`
- **Returns**: `{ success, data: vendorOrder }`

### GET `/api/vendors/analytics`
Get vendor analytics
- **Headers**: `Authorization: Bearer <vendor_token>`
- **Query Params**: `period` (week/month/year)
- **Returns**: `{ success, data: analytics }`

## Payment System

### POST `/api/payment/initialize`
Initialize payment
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ orderId, email }`
- **Returns**: `{ success, data: paymentDetails }`

### POST `/api/payment/verify`
Verify payment status
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ reference, orderId }`
- **Returns**: `{ success, data: { order, payment } }`

## Favorites/Wishlist

### GET `/api/favorites`
Get user's favorites
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `page`, `limit`
- **Returns**: `{ success, data: favorites }`

### POST `/api/favorites`
Add product to favorites
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ productId }`
- **Returns**: `{ success, data: favorite }`

### GET `/api/favorites/[productId]`
Check if product is favorited
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, isFavorite }`

### DELETE `/api/favorites/[productId]`
Remove from favorites
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, message }`

## Reviews System

### GET `/api/reviews`
Get reviews
- **Query Params**: `productId`, `vendorId`, `page`, `limit`, `rating`
- **Returns**: `{ success, data: reviews }`

### POST `/api/reviews`
Create review
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ productId, orderId, rating, comment, images }`
- **Returns**: `{ success, data: review }`

## Notifications

### GET `/api/notifications`
Get user notifications
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `page`, `limit`, `isRead`, `type`
- **Returns**: `{ success, data: notifications, unreadCount }`

### PUT `/api/notifications/[id]`
Mark notification as read/unread
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ isRead }`
- **Returns**: `{ success, data: notification }`

### PUT `/api/notifications/mark-all-read`
Mark all notifications as read
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, message }`

### DELETE `/api/notifications/[id]`
Delete notification
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, message }`

## Blog System

### GET `/api/blogs`
Get blog posts
- **Query Params**: `page`, `limit`, `category`, `search`
- **Returns**: `{ success, data: blogs }`

### POST `/api/blogs` (Admin/Vendor Only)
Create blog post
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, content, excerpt, category, readTime, imageUrl }`
- **Returns**: `{ success, data: blog }`

### GET `/api/blogs/[id]`
Get single blog post
- **Returns**: `{ success, data: blog }`

### PUT `/api/blogs/[id]` (Admin/Vendor Only)
Update blog post
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, content, excerpt, ... }`
- **Returns**: `{ success, data: blog }`

### DELETE `/api/blogs/[id]` (Admin/Vendor Only)
Delete blog post
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, message }`

## Search

### GET `/api/search`
Global search
- **Query Params**: `q` (required), `type` (all/products/vendors/blogs), `page`, `limit`
- **Returns**: `{ success, data: { products, vendors, blogs } }`

## File Upload

### POST `/api/upload`
Upload file
- **Headers**: `Authorization: Bearer <token>`
- **Body**: FormData with `file` and `type`
- **Returns**: `{ success, data: { url, fileName, fileSize, ... } }`

### DELETE `/api/upload`
Delete file
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `fileName`
- **Returns**: `{ success, message }`

## Admin Endpoints

### GET `/api/admin/users` (Admin Only)
Get all users
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query Params**: `page`, `limit`, `search`, `role`
- **Returns**: `{ success, data: users }`

### GET `/api/admin/users/[id]` (Admin Only)
Get user details
- **Headers**: `Authorization: Bearer <admin_token>`
- **Returns**: `{ success, data: user }`

### PUT `/api/admin/users/[id]` (Admin Only)
Update user
- **Headers**: `Authorization: Bearer <admin_token>`
- **Body**: `{ role, isActive }`
- **Returns**: `{ success, data: user }`

### DELETE `/api/admin/users/[id]` (Admin Only)
Delete user
- **Headers**: `Authorization: Bearer <admin_token>`
- **Returns**: `{ success, message }`

### GET `/api/admin/dashboard` (Admin Only)
Get admin dashboard data
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query Params**: `period` (week/month/year)
- **Returns**: `{ success, data: dashboardStats }`

## Error Handling

All endpoints return errors in the following format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

Most endpoints require authentication via Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained through login endpoints and should be stored securely on the client side.