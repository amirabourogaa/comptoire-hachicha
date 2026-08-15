import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useCreateVendorAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      vendorId, 
      email, 
      password 
    }: { 
      vendorId: string; 
      email: string; 
      password: string;
    }) => {
      // Use edge function to create vendor account without affecting admin session
      const { data, error } = await supabase.functions.invoke('create-vendor-auth', {
        body: { vendorId, email, password },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      if (!data?.success) {
        throw new Error('Échec de la création du compte');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: "Compte vendeur créé",
        description: "Le vendeur peut maintenant se connecter à son espace.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte vendeur",
        variant: "destructive",
      });
    },
  });
}

export function useApproveProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ is_approved })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['pending-products'] });
      toast({
        title: variables.is_approved ? "Produit approuvé" : "Produit rejeté",
        description: variables.is_approved 
          ? "Le produit est maintenant visible en boutique." 
          : "Le produit a été rejeté.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du produit",
        variant: "destructive",
      });
    },
  });
}

export function usePendingProducts() {
  const queryClient = useQueryClient();
  
  return {
    queryKey: ['pending-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug),
          vendor:vendors(id, name, logo_url)
        `)
        .eq('is_approved', false)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  };
}
