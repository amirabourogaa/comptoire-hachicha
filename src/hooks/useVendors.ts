import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
// import { vendorService, Vendor } from '@/services/api/vendorService';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  commission_rate: number;
  is_active: boolean;
  is_verified: boolean;
  bank_name?: string;
  account_number?: string;
  rib?: string;
  total_products?: number;
  total_orders?: number;
  total_revenue?: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// GET all vendors
export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API - Récupérer tous les vendeurs
      // ============================================================
      // const vendors = await vendorService.getAll();
      // return vendors.map(v => ({ ...v, id: v._id || v.id }));

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await (supabase as any)
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Vendor[];
    },
  });
}

// GET single vendor
export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API
      // ============================================================
      // const vendor = await vendorService.getById(id);
      // return { ...vendor, id: vendor._id || vendor.id };

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await (supabase as any)
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Vendor;
    },
    enabled: !!id,
  });
}

// CREATE vendor
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
      // ============================================================
      // 🔄 MERN API
      // ============================================================
      // const created = await vendorService.create(vendor);
      // return { ...created, id: created._id || created.id };

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await (supabase as any)
        .from('vendors')
        .insert([vendor])
        .select()
        .single();

      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// UPDATE vendor
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...vendor }: Partial<Vendor> & { id: string }) => {
      // ============================================================
      // 🔄 MERN API
      // ============================================================
      // const updated = await vendorService.update(id, vendor);
      // return { ...updated, id: updated._id || updated.id };

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await (supabase as any)
        .from('vendors')
        .update(vendor)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// DELETE vendor (includes cleaning up auth user and vendor_roles via edge function)
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // ============================================================
      // 🔄 MERN API
      // ============================================================
      // await vendorService.delete(id);

      // ============================================================
      // ✅ SUPABASE API (actif) - Use edge function to properly delete auth user
      // ============================================================
      const { data, error } = await supabase.functions.invoke('delete-vendor-auth', {
        body: { vendorId: id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// TOGGLE vendor status
export function useToggleVendorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // ============================================================
      // 🔄 MERN API
      // ============================================================
      // const updated = await vendorService.toggleStatus(id);
      // return { ...updated, id: updated._id || updated.id };

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await (supabase as any)
        .from('vendors')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// VERIFY vendor
export function useVerifyVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // ============================================================
      // 🔄 MERN API
      // ============================================================
      // const updated = await vendorService.verify(id);
      // return { ...updated, id: updated._id || updated.id };

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await (supabase as any)
        .from('vendors')
        .update({ is_verified: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Vendor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}
