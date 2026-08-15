import { API_BASE_URL, getAuthHeaders } from '@/config/api';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  description?: string | null;
  logo_url?: string | null;
  user_id?: string | null;
  // Address fields
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
  address_country?: string | null;
  // Bank details
  bank_name?: string | null;
  account_number?: string | null;
  rib?: string | null;
  // Status
  commission_rate: number;
  is_active: boolean;
  is_verified: boolean;
  // Stats
  total_products?: number | null;
  total_orders?: number | null;
  total_revenue?: number | null;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateVendorInput {
  name: string;
  email: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  bank_name?: string;
  account_number?: string;
  rib?: string;
  commission_rate?: number;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface VendorStats {
  total: number;
  active: number;
  verified: number;
}

const VENDORS_ENDPOINT = `${API_BASE_URL}/api/vendors`;

export const vendorService = {
  // Get all vendors
  getAll: async (token?: string): Promise<Vendor[]> => {
    const response = await fetch(VENDORS_ENDPOINT, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des vendeurs');
    return response.json();
  },

  // Get active and verified vendors (public)
  getPublic: async (): Promise<Vendor[]> => {
    const response = await fetch(`${VENDORS_ENDPOINT}?active=true&verified=true`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des vendeurs');
    return response.json();
  },

  // Get single vendor
  getById: async (id: string): Promise<Vendor> => {
    const response = await fetch(`${VENDORS_ENDPOINT}/${id}`);
    if (!response.ok) throw new Error('Vendeur non trouvé');
    return response.json();
  },

  // Create vendor
  create: async (vendor: CreateVendorInput, token: string): Promise<Vendor> => {
    const response = await fetch(VENDORS_ENDPOINT, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(vendor),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création');
    }
    return response.json();
  },

  // Update vendor
  update: async (id: string, vendor: Partial<CreateVendorInput>, token: string): Promise<Vendor> => {
    const response = await fetch(`${VENDORS_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(vendor),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour');
    return response.json();
  },

  // Delete vendor
  delete: async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${VENDORS_ENDPOINT}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
  },

  // Toggle vendor active status
  toggleStatus: async (id: string, token: string): Promise<Vendor> => {
    const response = await fetch(`${VENDORS_ENDPOINT}/${id}/toggle-status`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors du changement de statut');
    return response.json();
  },

  // Verify vendor
  verify: async (id: string, token: string): Promise<Vendor> => {
    const response = await fetch(`${VENDORS_ENDPOINT}/${id}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la vérification');
    return response.json();
  },

  // Get vendor stats
  getStats: async (token: string): Promise<VendorStats> => {
    const response = await fetch(`${VENDORS_ENDPOINT}/stats`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
    return response.json();
  },
};
