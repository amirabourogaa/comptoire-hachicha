import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentSettings {
  gateway_name: string;
  api_url: string;
  api_key: string;
  secret_key: string;
  webhook_url: string;
  currency: string;
  is_enabled: boolean;
  test_mode: boolean;
}

const defaultPaymentSettings: PaymentSettings = {
  gateway_name: '',
  api_url: '',
  api_key: '',
  secret_key: '',
  webhook_url: '',
  currency: 'TND',
  is_enabled: false,
  test_mode: true,
};

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'payment_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        try {
          return { ...defaultPaymentSettings, ...JSON.parse(data.value) } as PaymentSettings;
        } catch {
          return defaultPaymentSettings;
        }
      }
      return defaultPaymentSettings;
    },
  });
}

export function useUpdatePaymentSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: PaymentSettings) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'payment_settings')
        .single();

      const value = JSON.stringify(settings);

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value })
          .eq('key', 'payment_settings');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ key: 'payment_settings', value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
    },
  });
}

export function usePaymentTransactions() {
  return useQuery({
    queryKey: ['payment-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });
}
