import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductAttribute, ProductAttributeValue } from '@/types';

export function useProductAttributes(productId: string) {
  return useQuery({
    queryKey: ['product-attributes', productId],
    queryFn: async () => {
      const { data: attrs, error } = await supabase
        .from('product_attributes')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');

      if (error) throw error;

      // Fetch values for each attribute
      const attrIds = attrs.map(a => a.id);
      let values: ProductAttributeValue[] = [];
      if (attrIds.length > 0) {
        const { data: vals, error: valError } = await supabase
          .from('product_attribute_values')
          .select('*')
          .in('attribute_id', attrIds)
          .order('created_at');
        if (valError) throw valError;
        values = vals as ProductAttributeValue[];
      }

      return (attrs as ProductAttribute[]).map(attr => ({
        ...attr,
        values: values.filter(v => v.attribute_id === attr.id),
      }));
    },
    enabled: !!productId,
  });
}

export function useCreateProductAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attr: { product_id: string; name: string; display_order?: number }) => {
      const { data, error } = await supabase
        .from('product_attributes')
        .insert(attr)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-attributes', variables.product_id] });
    },
  });
}

export function useDeleteProductAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase.from('product_attributes').delete().eq('id', id);
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['product-attributes', productId] });
    },
  });
}

export function useCreateAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, ...value }: Omit<ProductAttributeValue, 'id' | 'created_at'> & { productId: string }) => {
      const { data, error } = await supabase
        .from('product_attribute_values')
        .insert({
          attribute_id: value.attribute_id,
          value: value.value,
          stock: value.stock,
          image_url: value.image_url,
          color_code: value.color_code,
          price_adjustment: value.price_adjustment,
          ...(value.price !== undefined && value.price !== null ? { price: value.price } : {}),
          ...(value.reference ? { reference: value.reference } : {}),
        })
        .select()
        .single();
      if (error) throw error;
      return { data, productId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['product-attributes', result.productId] });
    },
  });
}

export function useDeleteAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase.from('product_attribute_values').delete().eq('id', id);
      if (error) throw error;
      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['product-attributes', productId] });
    },
  });
}
