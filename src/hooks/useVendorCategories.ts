import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VendorCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  vendor_id: string | null;
  is_approved: boolean;
  created_at: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export function useVendorCategories() {
  const { vendorInfo } = useVendorAuth();

  return useQuery({
    queryKey: ['vendor-categories', vendorInfo?.id],
    queryFn: async () => {
      if (!vendorInfo?.id) return [];

      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          parent:categories!categories_parent_id_fkey(id, name, slug)
        `)
        .eq('vendor_id', vendorInfo.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform the parent array to single object
      return (data || []).map((cat: any) => ({
        ...cat,
        parent: cat.parent?.[0] || null,
      })) as VendorCategory[];
    },
    enabled: !!vendorInfo?.id,
  });
}

export function useCreateVendorCategory() {
  const queryClient = useQueryClient();
  const { vendorInfo } = useVendorAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (category: {
      name: string;
      slug: string;
      parent_id?: string | null;
    }) => {
      if (!vendorInfo?.id) throw new Error('Vendor not found');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          vendor_id: vendorInfo.id,
          is_approved: false, // Requires admin approval
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-categories'] });
      toast({
        title: "Catégorie créée",
        description: "Votre catégorie est en attente de validation par l'administrateur.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie",
        variant: "destructive",
      });
      console.error('Error creating category:', error);
    },
  });
}

export function useUpdateVendorCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      slug?: string;
      parent_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('categories')
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
      queryClient.invalidateQueries({ queryKey: ['vendor-categories'] });
      toast({
        title: "Catégorie modifiée",
        description: "Votre catégorie est en attente de re-validation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la catégorie",
        variant: "destructive",
      });
      console.error('Error updating category:', error);
    },
  });
}

export function useDeleteVendorCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-categories'] });
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie",
        variant: "destructive",
      });
      console.error('Error deleting category:', error);
    },
  });
}
