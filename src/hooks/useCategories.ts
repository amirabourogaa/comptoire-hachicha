import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';

// ============================================================
// 🔄 MERN API (décommentez pour utiliser le backend externe)
// ============================================================
// import { categoryService } from '@/services/api';
// import { authService } from '@/services/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API - Récupérer toutes les catégories
      // ============================================================
      // return await categoryService.getAll();

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_approved', true)
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });
}

// Get categories organized in a tree structure (for navbar - only show_in_navbar=true)
export function useCategoriesTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_approved', true)
        .eq('show_in_navbar', true)
        .order('name');

      if (error) throw error;
      
      const categories = data as Category[];
      
      // Build tree structure
      const rootCategories: Category[] = [];
      const categoryMap = new Map<string, Category>();
      
      // First pass: create map
      categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });
      
      // Second pass: build tree
      categories.forEach(cat => {
        const category = categoryMap.get(cat.id)!;
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      });
      
      return rootCategories;
    },
  });
}

// Toggle show_in_navbar for a category
export function useToggleCategoryNavbar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, show_in_navbar }: { id: string; show_in_navbar: boolean }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ show_in_navbar })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Get categories marked for homepage "Nos Collections" section
export function useCollectionCategories() {
  return useQuery({
    queryKey: ['categories', 'collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_approved', true)
        .eq('show_in_collections', true)
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });
}

// Toggle show_in_collections for a category
export function useToggleCategoryCollections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, show_in_collections }: { id: string; show_in_collections: boolean }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ show_in_collections })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Update category image and description
export function useUpdateCategoryMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, image_url, description }: { id: string; image_url?: string | null; description?: string | null }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ image_url, description })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}


// Get only parent categories (for dropdown selection)
export function useParentCategories() {
  return useQuery({
    queryKey: ['categories', 'parents'],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API - Catégories parentes uniquement
      // ============================================================
      // const categories = await categoryService.getAll();
      // return categories.filter(c => !c.parentId);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_approved', true)
        .is('parent_id', null)
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });
}

// Get all categories for admin (approved and unapproved)
export function useAllCategories() {
  return useQuery({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });
}

// Get pending categories for admin approval
export function usePendingCategories() {
  return useQuery({
    queryKey: ['categories', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          parent:categories!categories_parent_id_fkey(id, name, slug)
        `)
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((cat: any) => ({
        ...cat,
        parent: cat.parent?.[0] || null,
      }));
    },
  });
}

// Approve a category
export function useApproveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ is_approved: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: { name: string; slug: string; parent_id?: string | null }) => {
      // ============================================================
      // 🔄 MERN API - Créer une catégorie
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // return await categoryService.create({
      //   name: category.name,
      //   slug: category.slug,
      //   parentId: category.parent_id
      // }, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<Category> & { id: string }) => {
      // ============================================================
      // 🔄 MERN API - Modifier une catégorie
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // return await categoryService.update(id, category, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // ============================================================
      // 🔄 MERN API - Supprimer une catégorie
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // await categoryService.delete(id, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
