import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  card: string;
  border: string;
  gold: string;
  navbarBg: string;
  navbarText: string;
  buttonColor: string;
  hoverColor: string;
  footerBg: string;
  footerText: string;
}

export interface ThemeSettings {
  colors: ThemeColors;
  fontSerif: string;
  fontSans: string;
  borderRadius: string;
}

const defaultTheme: ThemeSettings = {
  colors: {
    primary: '30 10% 15%',
    secondary: '30 15% 92%',
    accent: '25 30% 85%',
    background: '30 20% 98%',
    foreground: '30 10% 10%',
    muted: '30 10% 94%',
    card: '30 15% 97%',
    border: '30 15% 88%',
    gold: '38 60% 55%',
    navbarBg: '30 22% 29%',
    navbarText: '40 38% 93%',
    buttonColor: '',
    hoverColor: '',
    footerBg: '',
    footerText: '',
  },
  fontSerif: 'Cormorant Garamond',
  fontSans: 'Inter',
  borderRadius: '0.25rem',
};

export function useThemeSettings() {
  return useQuery({
    queryKey: ['theme-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'theme_settings')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.value) {
        try {
          return JSON.parse(data.value) as ThemeSettings;
        } catch {
          return defaultTheme;
        }
      }
      return defaultTheme;
    },
  });
}

export function useUpdateThemeSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: ThemeSettings) => {
      // First check if setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'theme_settings')
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('site_settings')
          .update({ value: JSON.stringify(theme) })
          .eq('key', 'theme_settings')
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('site_settings')
          .insert({ key: 'theme_settings', value: JSON.stringify(theme) })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] });
    },
  });
}

export function getDefaultTheme(): ThemeSettings {
  return defaultTheme;
}
