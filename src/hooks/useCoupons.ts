import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// 🔄 MERN API (décommentez pour utiliser le backend externe)
// ============================================================
// import { couponService } from '@/services/api';
// import { authService } from '@/services/api';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_amount: number;
  maximum_uses: number | null;
  current_uses: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponInsert {
  code: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_amount?: number;
  maximum_uses?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
}

export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API - Récupérer tous les coupons (admin)
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // return await couponService.getAll(token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Coupon[];
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, cartTotal }: { code: string; cartTotal: number }) => {
      // ============================================================
      // 🔄 MERN API - Valider un coupon
      // ============================================================
      // const result = await couponService.validate(code, cartTotal);
      // if (!result.valid) throw new Error(result.message || 'Coupon invalide');
      // const coupon = result.coupon!;
      // let discountAmount: number;
      // if (coupon.discountType === 'percentage') {
      //   discountAmount = (cartTotal * coupon.discountValue) / 100;
      // } else {
      //   discountAmount = Math.min(coupon.discountValue, cartTotal);
      // }
      // return { coupon, discountAmount };

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('Code promo invalide');
      
      const coupon = data as Coupon;
      
      // Check if coupon is within date range
      const now = new Date();
      if (coupon.start_date && new Date(coupon.start_date) > now) {
        throw new Error('Ce code promo n\'est pas encore actif');
      }
      if (coupon.end_date && new Date(coupon.end_date) < now) {
        throw new Error('Ce code promo a expiré');
      }
      
      // Check usage limit
      if (coupon.maximum_uses !== null && coupon.current_uses >= coupon.maximum_uses) {
        throw new Error('Ce code promo a atteint sa limite d\'utilisation');
      }
      
      // Check minimum amount
      if (cartTotal < coupon.minimum_amount) {
        throw new Error(`Montant minimum requis: ${coupon.minimum_amount.toFixed(3)} TND`);
      }
      
      // Calculate discount
      let discountAmount: number;
      if (coupon.discount_type === 'percentage') {
        discountAmount = (cartTotal * coupon.discount_value) / 100;
      } else {
        discountAmount = Math.min(coupon.discount_value, cartTotal);
      }
      
      return {
        coupon,
        discountAmount,
      };
    },
  });
}

export function useIncrementCouponUsage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (couponCode: string) => {
      // ============================================================
      // 🔄 MERN API - Incrémenter l'usage du coupon (géré côté serveur)
      // ============================================================
      // Note: En MERN, l'incrémentation est automatiquement gérée
      // par l'endpoint validate lors de la création de commande

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      // First get the current coupon
      const { data: coupon, error: fetchError } = await supabase
        .from('coupons')
        .select('current_uses')
        .eq('code', couponCode)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Then update with incremented value
      const { error } = await supabase
        .from('coupons')
        .update({ current_uses: (coupon?.current_uses || 0) + 1 })
        .eq('code', couponCode);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coupon: CouponInsert) => {
      // ============================================================
      // 🔄 MERN API - Créer un coupon
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // return await couponService.create({
      //   code: coupon.code.toUpperCase().trim(),
      //   description: coupon.description,
      //   discountType: coupon.discount_type,
      //   discountValue: coupon.discount_value,
      //   minimumAmount: coupon.minimum_amount,
      //   maximumUses: coupon.maximum_uses,
      //   startDate: coupon.start_date,
      //   endDate: coupon.end_date,
      //   isActive: coupon.is_active
      // }, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          ...coupon,
          code: coupon.code.toUpperCase().trim(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Coupon> & { id: string }) => {
      // ============================================================
      // 🔄 MERN API - Modifier un coupon
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // return await couponService.update(id, {
      //   code: updates.code?.toUpperCase().trim(),
      //   description: updates.description,
      //   discountType: updates.discount_type,
      //   discountValue: updates.discount_value,
      //   minimumAmount: updates.minimum_amount,
      //   maximumUses: updates.maximum_uses,
      //   startDate: updates.start_date,
      //   endDate: updates.end_date,
      //   isActive: updates.is_active
      // }, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('coupons')
        .update({
          ...updates,
          code: updates.code?.toUpperCase().trim(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // ============================================================
      // 🔄 MERN API - Supprimer un coupon
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // await couponService.delete(id, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}
