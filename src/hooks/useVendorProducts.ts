import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VendorProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  promo_price: number | null;
  image_url: string | null;
  images: string[] | null;
  category_id: string | null;
  is_active: boolean;
  is_flash_sale: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export function useVendorProducts() {
  const { vendorInfo } = useVendorAuth();

  return useQuery({
    queryKey: ['vendor-products', vendorInfo?.id],
    queryFn: async () => {
      if (!vendorInfo?.id) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('vendor_id', vendorInfo.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VendorProduct[];
    },
    enabled: !!vendorInfo?.id,
  });
}

export function useCreateVendorProduct() {
  const queryClient = useQueryClient();
  const { vendorInfo } = useVendorAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: {
      title: string;
      description?: string;
      price: number;
      promo_price?: number | null;
      image_url?: string;
      images?: string[];
      category_id?: string | null;
      is_flash_sale?: boolean;
    }) => {
      if (!vendorInfo?.id) throw new Error('Vendor not found');

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...product,
          vendor_id: vendorInfo.id,
          is_active: true,
          is_approved: false, // Requires admin approval
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      toast({
        title: "Produit créé",
        description: "Votre produit est en attente de validation par l'administrateur.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le produit",
        variant: "destructive",
      });
      console.error('Error creating product:', error);
    },
  });
}

export function useUpdateVendorProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      title?: string;
      description?: string;
      price?: number;
      promo_price?: number | null;
      image_url?: string;
      images?: string[];
      category_id?: string | null;
      is_flash_sale?: boolean;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          is_approved: false, // Reset approval on update
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      toast({
        title: "Produit modifié",
        description: "Votre produit est en attente de re-validation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le produit",
        variant: "destructive",
      });
      console.error('Error updating product:', error);
    },
  });
}

export function useDeleteVendorProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      });
      console.error('Error deleting product:', error);
    },
  });
}
