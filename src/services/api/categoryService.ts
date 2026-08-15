import { API_ENDPOINTS, getAuthHeaders } from '@/config/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  vendor_id?: string | null;
  is_approved: boolean;
  show_in_navbar: boolean;
  created_at: string;
  // Relations
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  vendor?: {
    id: string;
    name: string;
    logo_url?: string | null;
  } | null;
  children?: Category[];
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  parent_id?: string | null;
  vendor_id?: string | null;
  is_approved?: boolean;
  show_in_navbar?: boolean;
}

export const categoryService = {
  // Récupérer toutes les catégories
  async getAll(): Promise<Category[]> {
    const response = await fetch(API_ENDPOINTS.categories);
    if (!response.ok) throw new Error('Erreur lors de la récupération des catégories');
    return response.json();
  },

  // Récupérer les catégories approuvées uniquement
  async getApproved(): Promise<Category[]> {
    const response = await fetch(`${API_ENDPOINTS.categories}?approved=true`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des catégories');
    return response.json();
  },

  // Récupérer les catégories pour la navbar
  async getNavbarCategories(): Promise<Category[]> {
    const response = await fetch(`${API_ENDPOINTS.categories}?navbar=true`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des catégories navbar');
    return response.json();
  },

  // Récupérer une catégorie par slug
  async getBySlug(slug: string): Promise<Category> {
    const response = await fetch(`${API_ENDPOINTS.categories}/slug/${slug}`);
    if (!response.ok) throw new Error('Catégorie non trouvée');
    return response.json();
  },

  // Récupérer une catégorie par ID
  async getById(id: string): Promise<Category> {
    const response = await fetch(`${API_ENDPOINTS.categories}/${id}`);
    if (!response.ok) throw new Error('Catégorie non trouvée');
    return response.json();
  },

  // Créer une catégorie (admin)
  async create(category: CreateCategoryInput, token: string): Promise<Category> {
    const response = await fetch(API_ENDPOINTS.categories, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Erreur lors de la création de la catégorie');
    return response.json();
  },

  // Modifier une catégorie (admin)
  async update(id: string, category: Partial<CreateCategoryInput>, token: string): Promise<Category> {
    const response = await fetch(`${API_ENDPOINTS.categories}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Erreur lors de la modification de la catégorie');
    return response.json();
  },

  // Supprimer une catégorie (admin)
  async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.categories}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression de la catégorie');
  },

  // Approuver une catégorie (admin)
  async approve(id: string, token: string): Promise<Category> {
    const response = await fetch(`${API_ENDPOINTS.categories}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ is_approved: true }),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'approbation de la catégorie');
    return response.json();
  },

  // Toggle navbar visibility (admin)
  async toggleNavbar(id: string, showInNavbar: boolean, token: string): Promise<Category> {
    const response = await fetch(`${API_ENDPOINTS.categories}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ show_in_navbar: showInNavbar }),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour');
    return response.json();
  },
};
