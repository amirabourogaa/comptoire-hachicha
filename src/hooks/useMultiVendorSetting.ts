import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MULTI_VENDOR_KEY = 'is_multi_vendor_enabled';

export function useMultiVendorSetting() {
  return useQuery({
    queryKey: ['site-settings', MULTI_VENDOR_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', MULTI_VENDOR_KEY)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      // Default to false if not set
      return data?.value === 'true';
    },
  });
}

export function useIsMultiVendorEnabled() {
  const { data: isEnabled, isLoading } = useMultiVendorSetting();
  return { isMultiVendorEnabled: isEnabled ?? false, isLoading };
}

export function useToggleMultiVendor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      // Try to update first
      const { data: updateData, error: updateError } = await supabase
        .from('site_settings')
        .update({ value: enabled ? 'true' : 'false', updated_at: new Date().toISOString() })
        .eq('key', MULTI_VENDOR_KEY)
        .select()
        .single();
      
      // If no row was updated (doesn't exist), insert it
      if (updateError && updateError.code === 'PGRST116') {
        const { data: insertData, error: insertError } = await supabase
          .from('site_settings')
          .insert({ key: MULTI_VENDOR_KEY, value: enabled ? 'true' : 'false' })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return insertData;
      }
      
      if (updateError) throw updateError;
      return updateData;
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: enabled ? 'Mode multi-vendeurs activé' : 'Mode multi-vendeurs désactivé',
        description: enabled 
          ? 'Les vendeurs peuvent maintenant créer des comptes et vendre sur votre plateforme.' 
          : 'Le mode vendeur est désactivé. Seul l\'admin peut gérer les produits.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le paramètre',
        variant: 'destructive',
      });
      console.error('Error toggling multi-vendor:', error);
    },
  });
}
