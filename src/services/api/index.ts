// Export de tous les services API pour le backend MERN
export { productService } from './productService';
export { categoryService } from './categoryService';
export { orderService } from './orderService';
export { authService } from './authService';
export { couponService } from './couponService';
export { vendorService } from './vendorService';

// Export des types - Products
export type { Product, ProductColor, ProductSize, CreateProductInput } from './productService';

// Export des types - Categories
export type { Category, CreateCategoryInput } from './categoryService';

// Export des types - Orders
export type { Order, OrderItem, OrderStatus, CreateOrderInput } from './orderService';

// Export des types - Auth
export type { User, LoginResponse, AdminRole } from './authService';

// Export des types - Coupons
export type { Coupon, CreateCouponInput, ValidateCouponResponse, DiscountType } from './couponService';

// Export des types - Vendors
export type { Vendor, CreateVendorInput, VendorStats } from './vendorService';

// Export de la configuration
export { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '@/config/api';
