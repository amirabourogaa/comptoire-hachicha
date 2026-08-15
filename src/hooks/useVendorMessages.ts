import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVendorAuth } from '@/contexts/VendorAuthContext';

export interface VendorMessage {
  id: string;
  vendor_id: string;
  sender_email: string;
  sender_phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  vendor?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

// For vendor dashboard - get messages for their store
export function useVendorMessages() {
  const { vendorInfo } = useVendorAuth();

  return useQuery({
    queryKey: ['vendor-messages', vendorInfo?.id],
    queryFn: async () => {
      if (!vendorInfo?.id) return [];

      const { data, error } = await supabase
        .from('vendor_messages')
        .select('*')
        .eq('vendor_id', vendorInfo.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VendorMessage[];
    },
    enabled: !!vendorInfo?.id,
  });
}

// For admin dashboard - get all messages grouped by vendor
export function useAllVendorMessages() {
  return useQuery({
    queryKey: ['all-vendor-messages'],
    queryFn: async () => {
      const { data: messages, error } = await supabase
        .from('vendor_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch vendors separately
      const vendorIds = [...new Set(messages?.map(m => m.vendor_id) || [])];
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, name, logo_url')
        .in('id', vendorIds);

      // Combine
      return (messages || []).map(msg => ({
        ...msg,
        vendor: vendors?.find(v => v.id === msg.vendor_id) || null,
      })) as VendorMessage[];
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_messages')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-messages'] });
      queryClient.invalidateQueries({ queryKey: ['all-vendor-messages'] });
    },
  });
}

export function useDeleteVendorMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-messages'] });
      queryClient.invalidateQueries({ queryKey: ['all-vendor-messages'] });
    },
  });
}
