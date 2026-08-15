import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) throw error;
      return data as SiteSetting[];
    },
  });
}

export function useSiteSetting(key: string) {
  return useQuery({
    queryKey: ['site-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', key)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as SiteSetting | null;
    },
  });
}

export function useLogoUrl() {
  const { data: setting, isLoading } = useSiteSetting('logo_url');
  return {
    logoUrl: setting?.value || null,
    isLoading,
  };
}

export type NavbarStyle = 'classic' | 'minimal' | 'centered' | 'modern' | 'glassmorphism' | 'elevated' | 'bordered' | 'pill' | 'floating' | 'underline' | 'mega' | 'scrollable';

export function useNavbarStyle() {
  const { data: setting, isLoading } = useSiteSetting('navbar_style');
  return {
    navbarStyle: (setting?.value as NavbarStyle) || 'classic',
    isLoading,
  };
}

export function useUpdateSiteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string | null }) => {
      // First try to update
      const { data: updateData, error: updateError } = await supabase
        .from('site_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single();
      
      // If no row was updated (doesn't exist), insert it
      if (updateError && updateError.code === 'PGRST116') {
        const { data: insertData, error: insertError } = await supabase
          .from('site_settings')
          .insert({ key, value })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return insertData;
      }
      
      if (updateError) throw updateError;
      return updateData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}
