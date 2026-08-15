import { API_ENDPOINTS, getAuthHeaders } from '@/config/api';

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  minimum_amount?: number | null;
  maximum_uses?: number | null;
  current_uses: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponInput {
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  minimum_amount?: number | null;
  maximum_uses?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discount_amount?: number;
  message?: string;
}

export const couponService = {
  // Valider un coupon
  async validate(code: string, cartTotal: number): Promise<ValidateCouponResponse> {
    const response = await fetch(API_ENDPOINTS.validateCoupon, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code, cart_total: cartTotal }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Code promo invalide');
    }
    return response.json();
  },

  // Récupérer tous les coupons (admin)
  async getAll(token: string): Promise<Coupon[]> {
    const response = await fetch(API_ENDPOINTS.coupons, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des coupons');
    return response.json();
  },

  // Récupérer un coupon par ID (admin)
  async getById(id: string, token: string): Promise<Coupon> {
    const response = await fetch(`${API_ENDPOINTS.coupons}/${id}`, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Coupon non trouvé');
    return response.json();
  },

  // Créer un coupon (admin)
  async create(coupon: CreateCouponInput, token: string): Promise<Coupon> {
    const response = await fetch(API_ENDPOINTS.coupons, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(coupon),
    });
    if (!response.ok) throw new Error('Erreur lors de la création du coupon');
    return response.json();
  },

  // Modifier un coupon (admin)
  async update(id: string, coupon: Partial<CreateCouponInput>, token: string): Promise<Coupon> {
    const response = await fetch(`${API_ENDPOINTS.coupons}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(coupon),
    });
    if (!response.ok) throw new Error('Erreur lors de la modification du coupon');
    return response.json();
  },

  // Supprimer un coupon (admin)
  async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.coupons}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression du coupon');
  },
};
