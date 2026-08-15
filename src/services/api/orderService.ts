import { API_ENDPOINTS, getAuthHeaders } from '@/config/api';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'returned' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_title: string;
  product_price: number;
  quantity: number;
  created_at: string;
  // Relation
  product?: {
    id: string;
    title: string;
    image_url?: string | null;
  } | null;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  customer_address: string;
  total_amount: number;
  discount_amount?: number | null;
  coupon_code?: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  // Relation
  order_items?: OrderItem[];
}

export interface CreateOrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address: string;
  total_amount: number;
  discount_amount?: number;
  coupon_code?: string;
  items: Array<{
    product_id: string;
    product_title: string;
    product_price: number;
    quantity: number;
  }>;
}

export const orderService = {
  // Récupérer toutes les commandes (admin)
  async getAll(token: string): Promise<Order[]> {
    const response = await fetch(API_ENDPOINTS.orders, {
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des commandes');
    return response.json();
  },

  // Récupérer une commande par ID
  async getById(id: string): Promise<Order> {
    const response = await fetch(`${API_ENDPOINTS.orders}/${id}`);
    if (!response.ok) throw new Error('Commande non trouvée');
    return response.json();
  },

  // Créer une commande
  async create(order: CreateOrderInput): Promise<Order> {
    const response = await fetch(API_ENDPOINTS.orders, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error('Erreur lors de la création de la commande');
    return response.json();
  },

  // Mettre à jour le statut d'une commande (admin)
  async updateStatus(id: string, status: OrderStatus, token: string): Promise<Order> {
    const response = await fetch(`${API_ENDPOINTS.orders}/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut');
    return response.json();
  },

  // Supprimer une commande (admin)
  async delete(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.orders}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression de la commande');
  },
};
