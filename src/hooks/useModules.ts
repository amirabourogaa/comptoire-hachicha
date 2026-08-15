import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ModulesConfig {
  homepage_slider: boolean;
  promotional_banners: boolean;
  featured_products: boolean;
  flash_sales: boolean;
  category_slider: boolean;
  category_highlights: boolean;
  similar_products: boolean;
  partner_slider: boolean;
  catalog_download: boolean;
  agencies: boolean;
  appointments: boolean;
  online_payment: boolean;
}

const defaultModules: ModulesConfig = {
  homepage_slider: true,
  promotional_banners: true,
  featured_products: true,
  flash_sales: false,
  category_slider: false,
  category_highlights: false,
  similar_products: true,
  partner_slider: true,
  catalog_download: false,
  agencies: false,
  appointments: false,
  online_payment: false,
};

export const moduleLabels: Record<keyof ModulesConfig, { label: string; description: string }> = {
  homepage_slider: { label: 'Slider Hero', description: 'Bannière slider sur la page d\'accueil' },
  promotional_banners: { label: 'Bannières promotionnelles', description: 'Blocs marketing pour campagnes' },
  featured_products: { label: 'Produits vedettes', description: 'Produits mis en avant sur la page d\'accueil' },
  flash_sales: { label: 'Ventes Flash', description: 'Page de promotions avec compte à rebours' },
  category_slider: { label: 'Slider Catégorie', description: 'Slider en haut des pages catégorie' },
  category_highlights: { label: 'Suggestions Catégories', description: 'Blocs visuels de catégories' },
  similar_products: { label: 'Produits similaires', description: 'Slider de produits similaires sur la fiche produit' },
  partner_slider: { label: 'Slider Partenaires', description: 'Logos des partenaires en slider' },
  catalog_download: { label: 'Téléchargement Catalogues', description: 'Section de téléchargement de catalogues PDF' },
  agencies: { label: 'Nos Agences', description: 'Page listant les agences/points de vente' },
  appointments: { label: 'Prise de Rendez-vous', description: 'Formulaire de prise de rendez-vous' },
  online_payment: { label: 'Paiement en ligne', description: 'Passerelle de paiement intégrée au checkout' },
};

export function useModules() {
  return useQuery({
    queryKey: ['modules-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'modules_config')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        try {
          return { ...defaultModules, ...JSON.parse(data.value) } as ModulesConfig;
        } catch {
          return defaultModules;
        }
      }
      return defaultModules;
    },
    staleTime: 0,
  });
}

export function useIsModuleEnabled(module: keyof ModulesConfig) {
  const { data } = useModules();
  return data?.[module] ?? defaultModules[module];
}

export function useUpdateModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modules: ModulesConfig) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'modules_config')
        .single();

      const value = JSON.stringify(modules);

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value })
          .eq('key', 'modules_config');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ key: 'modules_config', value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules-config'] });
    },
  });
}
