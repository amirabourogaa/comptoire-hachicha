import { API_ENDPOINTS, getAuthHeaders } from '@/config/api';

export interface ProductColor {
  id?: string;
  color_name: string;
  color_code: string | null;
  image_url: string;
}

export interface ProductSize {
  id?: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  promo_price?: number | null;
  image_url?: string | null;
  images?: string[] | null;
  category_id?: string | null;
  vendor_id?: string | null;
  is_active: boolean;
  is_approved: boolean;
  is_flash_sale: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  vendor?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    description?: string | null;
    logo_url?: string | null;
    is_verified: boolean;
  } | null;
  product_colors?: ProductColor[];
  product_sizes?: ProductSize[];
}

export interface CreateProductInput {
  title: string;
  description?: string;
  price: number;
  promo_price?: number | null;
  image_url?: string;
  images?: string[];
  category_id?: string;
  vendor_id?: string;
  is_active?: boolean;
  is_approved?: boolean;
  is_flash_sale?: boolean;
}

export const productService = {
  // Récupérer tous les produits
  async getAll(): Promise<Product[]> {
    const response = await fetch(API_ENDPOINTS.products);
    if (!response.ok) throw new Error('Erreur lors de la récupération des produits');
    return response.json();
  },

  // Récupérer les produits par catégorie
  async getByCategory(categorySlug: string): Promise<Product[]> {
    const response = await fetch(`${API_ENDPOINTS.products}?category=${categorySlug}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des produits');
    return response.json();
  },

  // Récupérer un produit par ID
  async getById(id: string): Promise<Product> {
    const response = await fetch(`${API_ENDPOINTS.products}/${id}`);
    if (!response.ok) throw new Error('Produit non trouvé');
    return response.json();
  },

  // Créer un produit (admin)
  async create(product: CreateProductInput, token: string): Promise<Product> {
    const response = await fetch(API_ENDPOINTS.products, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Erreur lors de la création du produit');
    return response.json();
  },

  // Modifier un produit (admin)
  async update(id: string, product: Partial<CreateProductInput>, token: string): Promise<Product> {
    const response = await fetch(`${API_ENDPOINTS.products}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Erreur lors de la modification du produit');
    return response.json();
  },

  // Supprimer un produit (admin)
  async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.products}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression du produit');
  },

  // Approuver un produit (admin)
  async approve(id: string, token: string): Promise<Product> {
    const response = await fetch(`${API_ENDPOINTS.products}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ is_approved: true }),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'approbation du produit');
    return response.json();
  },

  // Rejeter un produit (admin)
  async reject(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.products}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors du rejet du produit');
  },
};
