import { API_ENDPOINTS, getAuthHeaders } from '@/config/api';

export type AdminRole = 'super_admin' | 'admin';
export type AdminSection = 'products' | 'categories' | 'orders' | 'coupons' | 'hero_slides' | 'settings' | 'admin_users' | 'vendors';

export interface User {
  id: string;
  email: string;
  role: AdminRole;
  permissions: AdminSection[];
  created_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  // Connexion
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(API_ENDPOINTS.login, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur de connexion');
    }
    
    return response.json();
  },

  // Récupérer tous les utilisateurs (super_admin)
  async getAll(token: string): Promise<User[]> {
    const response = await fetch(API_ENDPOINTS.users, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
    return response.json();
  },

  // Créer un utilisateur (super_admin)
  async create(userData: { email: string; password: string; role: AdminRole; permissions?: AdminSection[] }, token: string): Promise<User> {
    const response = await fetch(API_ENDPOINTS.users, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Erreur lors de la création de l\'utilisateur');
    return response.json();
  },

  // Modifier les permissions d'un utilisateur (super_admin)
  async updatePermissions(id: string, permissions: AdminSection[], token: string): Promise<User> {
    const response = await fetch(`${API_ENDPOINTS.users}/${id}/permissions`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ permissions }),
    });
    if (!response.ok) throw new Error('Erreur lors de la modification des permissions');
    return response.json();
  },

  // Modifier un utilisateur (super_admin)
  async update(id: string, userData: Partial<User>, token: string): Promise<User> {
    const response = await fetch(`${API_ENDPOINTS.users}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Erreur lors de la modification de l\'utilisateur');
    return response.json();
  },

  // Supprimer un utilisateur (super_admin)
  async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.users}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression de l\'utilisateur');
  },

  // Sauvegarder le token
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  // Récupérer le token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Supprimer le token (déconnexion)
  logout(): void {
    localStorage.removeItem('auth_token');
  },
};
