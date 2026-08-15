import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductSize, ProductColor } from '@/types';

// Sizes hooks
export function useProductSizes(productId: string) {
  return useQuery({
    queryKey: ['product-sizes', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_sizes')
        .select('*')
        .eq('product_id', productId)
        .order('size');

      if (error) throw error;
      return data as ProductSize[];
    },
    enabled: !!productId,
  });
}

export function useCreateProductSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (size: Omit<ProductSize, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('product_sizes')
        .insert(size)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-sizes', variables.product_id] });
    },
  });
}

export function useDeleteProductSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase.from('product_sizes').delete().eq('id', id);
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['product-sizes', productId] });
    },
  });
}

// Colors hooks
export function useProductColors(productId: string) {
  return useQuery({
    queryKey: ['product-colors', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_colors')
        .select('*')
        .eq('product_id', productId)
        .order('created_at');

      if (error) throw error;
      return data as ProductColor[];
    },
    enabled: !!productId,
  });
}

export function useCreateProductColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (color: Omit<ProductColor, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('product_colors')
        .insert(color)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-colors', variables.product_id] });
    },
  });
}

export function useDeleteProductColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase.from('product_colors').delete().eq('id', id);
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['product-colors', productId] });
    },
  });
}
