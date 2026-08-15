import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SectionConfig {
  id: string;
  name: string;
  key: string;
  enabled: boolean;
  description: string;
}

export const HOMEPAGE_SECTIONS: Omit<SectionConfig, 'enabled'>[] = [
  { id: 'hero', key: 'section_hero_enabled', name: 'Hero (Slider)', description: 'Le carousel principal en haut de page' },
  { id: 'features', key: 'section_features_enabled', name: 'Avantages', description: 'Section des avantages clients' },
  { id: 'flash_sale', key: 'section_flash_sale_enabled', name: 'Ventes Flash', description: 'Produits en promotion' },
  { id: 'stats', key: 'section_stats_enabled', name: 'Statistiques', description: 'Chiffres clés de la boutique' },
  { id: 'categories', key: 'section_categories_enabled', name: 'Catégories', description: 'Bannières des catégories' },
  { id: 'testimonials', key: 'section_testimonials_enabled', name: 'Témoignages', description: 'Avis des clients' },
  { id: 'about', key: 'section_about_enabled', name: 'À propos', description: 'Section de présentation' },
  { id: 'partners', key: 'section_partners_enabled', name: 'Partenaires', description: 'Logos des partenaires' },
  { id: 'products', key: 'section_products_enabled', name: 'Produits', description: 'Grille des produits' },
];

export function useSectionVisibility() {
  return useQuery({
    queryKey: ['section-visibility'],
    queryFn: async () => {
      const keys = HOMEPAGE_SECTIONS.map(s => s.key);
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', keys);
      
      if (error) throw error;
      
      // Map settings to section configs
      const settingsMap = new Map(data?.map(d => [d.key, d.value]) || []);
      
      return HOMEPAGE_SECTIONS.map(section => ({
        ...section,
        enabled: settingsMap.get(section.key) !== 'false', // Default to true
      }));
    },
  });
}

export function useIsSectionEnabled(sectionId: string) {
  const { data: sections } = useSectionVisibility();
  const section = sections?.find(s => s.id === sectionId);
  return section?.enabled ?? true; // Default to true if not found
}

export function useToggleSectionVisibility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      // Try to update first
      const { data: updateData, error: updateError } = await supabase
        .from('site_settings')
        .update({ value: enabled ? 'true' : 'false', updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single();
      
      // If no row was updated (doesn't exist), insert it
      if (updateError && updateError.code === 'PGRST116') {
        const { data: insertData, error: insertError } = await supabase
          .from('site_settings')
          .insert({ key, value: enabled ? 'true' : 'false' })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return insertData;
      }
      
      if (updateError) throw updateError;
      return updateData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section-visibility'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}
