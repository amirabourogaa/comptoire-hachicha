import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

// ============================================================
// 🔄 MERN API (décommentez pour utiliser le backend externe)
// ============================================================
// import { productService } from '@/services/api';
// import { authService } from '@/services/api';

export function useProducts(categorySlug?: string) {
  return useQuery({
    queryKey: ['products', categorySlug],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API - Récupérer tous les produits
      // ============================================================
      // const products = await productService.getAll();
      // if (categorySlug) {
      //   return products.filter(p => p.category?.slug === categorySlug);
      // }
      // return products;

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      if (categorySlug) {
        // Get the category and its subcategories
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();

        if (category) {
          // Get all subcategories of this category
          const { data: subcategories } = await supabase
            .from('categories')
            .select('id')
            .eq('parent_id', category.id);

          // Build array of category IDs (parent + all children)
          const categoryIds = [category.id, ...(subcategories?.map(sc => sc.id) || [])];

          // Fetch products from parent category and all subcategories
          const { data, error } = await supabase
            .from('products')
            .select('*, category:categories(*), vendor:vendors(id, name, email, phone, description, logo_url, address_city, address_country, is_verified)')
            .eq('is_active', true)
            .eq('is_approved', true)
            .in('category_id', categoryIds)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return data as Product[];
        }
      }

      // No category filter - return all active products
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), vendor:vendors(id, name, email, phone, description, logo_url, address_city, address_country, is_verified)')
        .eq('is_active', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useFlashSaleProducts() {
  return useQuery({
    queryKey: ['products', 'flash-sale'],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API - Produits en vente flash
      // ============================================================
      // const products = await productService.getAll();
      // return products.filter(p => p.isFlashSale);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), vendor:vendors(id, name, email, phone, description, logo_url, address_city, address_country, is_verified)')
        .eq('is_active', true)
        .eq('is_approved', true)
        .eq('is_flash_sale', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProductsByVendor(vendorId: string) {
  return useQuery({
    queryKey: ['products', 'vendor', vendorId],
    queryFn: async () => {
      // Fetch vendor info
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id, name, email, phone, description, logo_url, address_city, address_country, is_verified')
        .eq('id', vendorId)
        .maybeSingle();

      if (vendorError) throw vendorError;

      // Fetch vendor products
      const { data: products, error } = await supabase
        .from('products')
        .select('*, category:categories(*), vendor:vendors(id, name, email, phone, description, logo_url, address_city, address_country, is_verified)')
        .eq('vendor_id', vendorId)
        .eq('is_active', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        vendor,
        products: products as Product[],
      };
    },
    enabled: !!vendorId,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // ============================================================
      // 🔄 MERN API - Récupérer un produit par ID
      // ============================================================
      // return await productService.getById(id);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), vendor:vendors(id, name, email, phone, description, logo_url, address_city, address_country, is_verified)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!id,
  });
}

export function useAllProducts(
  page?: number,
  pageSize?: number,
  search?: string,
  categoryId?: string
) {
  return useQuery({
    queryKey: ['products', 'all', page, pageSize, search, categoryId],
    queryFn: async () => {
      const usePagination = typeof page === 'number' && typeof pageSize === 'number';

      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      let dataQuery = supabase
        .from('products')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false });

      if (search) {
        countQuery = countQuery.ilike('title', `%${search}%`);
        dataQuery = dataQuery.ilike('title', `%${search}%`);
      }
      if (categoryId) {
        countQuery = countQuery.eq('category_id', categoryId);
        dataQuery = dataQuery.eq('category_id', categoryId);
      }

      if (usePagination) {
        dataQuery = dataQuery.range((page! - 1) * pageSize!, page! * pageSize! - 1);
      }

      const [{ count, error: countError }, { data, error }] = await Promise.all([
        countQuery,
        dataQuery,
      ]);
      if (countError) throw countError;
      if (error) throw error;
      return { products: (data ?? []) as any[], total: count ?? 0 };
    },
  });
}


export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
      // ============================================================
      // 🔄 MERN API - Créer un produit
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // return await productService.create(product, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      // ============================================================
      // 🔄 MERN API - Modifier un produit
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // return await productService.update(id, product, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // ============================================================
      // 🔄 MERN API - Supprimer un produit
      // ============================================================
      // const token = authService.getToken();
      // if (!token) throw new Error('Non authentifié');
      // await productService.delete(id, token);

      // ============================================================
      // ✅ SUPABASE API (actif)
      // ============================================================
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
