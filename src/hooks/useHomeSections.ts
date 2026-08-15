import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_role: string | null;
  customer_avatar: string | null;
  content: string;
  rating: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  icon: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TESTIMONIALS HOOKS
// ============================================================================

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      // --- MERN API (commenté) ---
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/testimonials`);
      // if (!response.ok) throw new Error('Failed to fetch testimonials');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Testimonial[];
    },
  });
}

export function useActiveTestimonials() {
  return useQuery({
    queryKey: ['testimonials', 'active'],
    queryFn: async () => {
      // --- MERN API (commenté) ---
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/testimonials/active`);
      // if (!response.ok) throw new Error('Failed to fetch testimonials');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Testimonial[];
    },
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/testimonials`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(testimonial)
      // });
      // if (!response.ok) throw new Error('Failed to create testimonial');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Testimonial> & { id: string }) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/testimonials/${id}`, {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(updates)
      // });
      // if (!response.ok) throw new Error('Failed to update testimonial');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/testimonials/${id}`, {
      //   method: 'DELETE',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // if (!response.ok) throw new Error('Failed to delete testimonial');

      // --- Supabase API (actif) ---
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
}

// ============================================================================
// FEATURES HOOKS
// ============================================================================

export function useFeatures() {
  return useQuery({
    queryKey: ['features'],
    queryFn: async () => {
      // --- MERN API (commenté) ---
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/features`);
      // if (!response.ok) throw new Error('Failed to fetch features');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Feature[];
    },
  });
}

export function useActiveFeatures() {
  return useQuery({
    queryKey: ['features', 'active'],
    queryFn: async () => {
      // --- MERN API (commenté) ---
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/features/active`);
      // if (!response.ok) throw new Error('Failed to fetch features');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Feature[];
    },
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (feature: Omit<Feature, 'id' | 'created_at' | 'updated_at'>) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/features`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(feature)
      // });
      // if (!response.ok) throw new Error('Failed to create feature');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('features')
        .insert(feature)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}

export function useUpdateFeature() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Feature> & { id: string }) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/features/${id}`, {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(updates)
      // });
      // if (!response.ok) throw new Error('Failed to update feature');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('features')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}

export function useDeleteFeature() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/features/${id}`, {
      //   method: 'DELETE',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // if (!response.ok) throw new Error('Failed to delete feature');

      // --- Supabase API (actif) ---
      const { error } = await supabase
        .from('features')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
  });
}

// ============================================================================
// PARTNERS HOOKS
// ============================================================================

export function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      // --- MERN API (commenté) ---
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/partners`);
      // if (!response.ok) throw new Error('Failed to fetch partners');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Partner[];
    },
  });
}

export function useActivePartners() {
  return useQuery({
    queryKey: ['partners', 'active'],
    queryFn: async () => {
      // --- MERN API (commenté) ---
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/partners/active`);
      // if (!response.ok) throw new Error('Failed to fetch partners');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Partner[];
    },
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/partners`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(partner)
      // });
      // if (!response.ok) throw new Error('Failed to create partner');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('partners')
        .insert(partner)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Partner> & { id: string }) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/partners/${id}`, {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(updates)
      // });
      // if (!response.ok) throw new Error('Failed to update partner');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/partners/${id}`, {
      //   method: 'DELETE',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // if (!response.ok) throw new Error('Failed to delete partner');

      // --- Supabase API (actif) ---
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

// ============================================================================
// STATS HOOKS
// ============================================================================

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      // --- MERN API (commenté) ---
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`);
      // if (!response.ok) throw new Error('Failed to fetch stats');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('stats')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Stat[];
    },
  });
}

export function useActiveStats() {
  return useQuery({
    queryKey: ['stats', 'active'],
    queryFn: async () => {
      // --- MERN API (commenté) ---
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/active`);
      // if (!response.ok) throw new Error('Failed to fetch stats');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('stats')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Stat[];
    },
  });
}

export function useCreateStat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stat: Omit<Stat, 'id' | 'created_at' | 'updated_at'>) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`, {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(stat)
      // });
      // if (!response.ok) throw new Error('Failed to create stat');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('stats')
        .insert(stat)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateStat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Stat> & { id: string }) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/${id}`, {
      //   method: 'PUT',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(updates)
      // });
      // if (!response.ok) throw new Error('Failed to update stat');
      // return response.json();

      // --- Supabase API (actif) ---
      const { data, error } = await supabase
        .from('stats')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteStat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // --- MERN API (commenté) ---
      // const token = localStorage.getItem('admin_token');
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats/${id}`, {
      //   method: 'DELETE',
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // if (!response.ok) throw new Error('Failed to delete stat');

      // --- Supabase API (actif) ---
      const { error } = await supabase
        .from('stats')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
