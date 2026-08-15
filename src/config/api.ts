// Configuration API pour le backend MERN
// Changez cette URL par l'URL de votre serveur déployé (Render, Railway, etc.)

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Products
  products: `${API_BASE_URL}/api/products`,
  
  // Categories
  categories: `${API_BASE_URL}/api/categories`,
  
  // Orders
  orders: `${API_BASE_URL}/api/orders`,
  
  // Users / Auth
  users: `${API_BASE_URL}/api/users`,
  login: `${API_BASE_URL}/api/users/login`,
  
  // Coupons
  coupons: `${API_BASE_URL}/api/coupons`,
  validateCoupon: `${API_BASE_URL}/api/coupons/validate`,
  
  // Vendors
  vendors: `${API_BASE_URL}/api/vendors`,
  
  // Hero Slides
  heroSlides: `${API_BASE_URL}/api/hero-slides`,
  
  // Site Settings
  settings: `${API_BASE_URL}/api/settings`,
  
  // Health check
  health: `${API_BASE_URL}/api/health`,
};

// Helper pour les headers avec authentification
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
