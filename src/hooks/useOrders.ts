import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderStatus } from '@/types';

// ============================================================
// 🔄 MERN API (décommentez pour utiliser le backend externe)
// ============================================================
// import { orderService } from '@/services/api';
// import { authService } from '@/services/api';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API - Récupérer toutes les commandes (admin)
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // return await orderService.getAll(token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API - Récupérer une commande par ID
      // ============================================================
      // return await orderService.getById(id);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Order | null;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      order,
      items,
    }: {
      order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'items'>;
      items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[];
    }) => {
      // ============================================================
      // 🔄 MERN API - Créer une commande
      // ============================================================
      // return await orderService.create({
      //   customerName: order.customer_name,
      //   customerEmail: order.customer_email,
      //   customerPhone: order.customer_phone || undefined,
      //   customerAddress: order.customer_address,
      //   totalAmount: order.total_amount,
      //   couponCode: order.coupon_code || undefined,
      //   discountAmount: order.discount_amount,
      //   items: items.map(item => ({
      //     product: item.product_id || '',
      //     productTitle: item.product_title,
      //     productPrice: item.product_price,
      //     quantity: item.quantity
      //   }))
      // });

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(order as any)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        ...item,
        order_id: orderData.id,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return orderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      // ============================================================
      // 🔄 MERN API - Modifier le statut d'une commande
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // return await orderService.updateStatus(id, status, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
