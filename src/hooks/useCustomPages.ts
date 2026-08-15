import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CustomPage, PageBlock, CoverStyleOptions } from '@/types/pageBuilder';

export function useCustomPages() {
  return useQuery({
    queryKey: ['custom-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return (data as any[]).map(mapPage);
    },
  });
}

export function useNavbarPages() {
  return useQuery({
    queryKey: ['custom-pages', 'navbar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('is_published', true)
        .eq('show_in_navbar', true)
        .order('display_order');
      if (error) throw error;
      return (data as any[]).map(mapPage);
    },
  });
}

export function useCustomPage(slug: string) {
  return useQuery({
    queryKey: ['custom-pages', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapPage(data) : null;
    },
    enabled: !!slug,
  });
}

export function useCreateCustomPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (page: { title: string; slug: string; blocks: PageBlock[]; is_published: boolean; show_in_navbar?: boolean; navbar_label?: string; cover_image_url?: string | null; cover_style?: CoverStyleOptions }) => {
      const { data, error } = await supabase
        .from('custom_pages')
        .insert({
          title: page.title,
          slug: page.slug,
          blocks: JSON.parse(JSON.stringify(page.blocks)),
          is_published: page.is_published,
          show_in_navbar: page.show_in_navbar ?? true,
          navbar_label: page.navbar_label || null,
          cover_image_url: page.cover_image_url || null,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return mapPage(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-pages'] }),
  });
}

export function useUpdateCustomPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; slug?: string; blocks?: PageBlock[]; is_published?: boolean; show_in_navbar?: boolean; navbar_label?: string; cover_image_url?: string | null; cover_style?: CoverStyleOptions }) => {
      const payload: any = { ...updates };
      if (updates.blocks) payload.blocks = JSON.parse(JSON.stringify(updates.blocks));
      // Store cover_style inside blocks json since we don't have a separate column
      // We'll store it as a metadata field alongside the page data
      delete payload.cover_style;
      
      // Merge cover_style into blocks metadata
      if (updates.blocks || updates.cover_style) {
        const blocksWithMeta = {
          _blocks: updates.blocks ? JSON.parse(JSON.stringify(updates.blocks)) : undefined,
          _cover_style: updates.cover_style || undefined,
        };
        // Store as a structured JSON with blocks array and metadata
        payload.blocks = JSON.parse(JSON.stringify([
          ...(updates.blocks || []),
          // Store cover_style as a hidden metadata block
          ...(updates.cover_style ? [{ id: '__cover_style__', type: 'meta', data: updates.cover_style }] : []),
        ]));
      }

      const { data, error } = await supabase
        .from('custom_pages')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return mapPage(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-pages'] }),
  });
}

export function useDeleteCustomPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-pages'] }),
  });
}

function mapPage(row: any): CustomPage {
  let blocks = Array.isArray(row.blocks) ? row.blocks : [];
  let cover_style: CoverStyleOptions | null = null;
  
  // Extract cover_style from metadata block
  const metaBlock = blocks.find((b: any) => b.id === '__cover_style__' && b.type === 'meta');
  if (metaBlock) {
    cover_style = metaBlock.data as CoverStyleOptions;
    blocks = blocks.filter((b: any) => b.id !== '__cover_style__');
  }

  return {
    ...row,
    blocks,
    cover_style,
    show_in_navbar: row.show_in_navbar ?? false,
    navbar_label: row.navbar_label ?? null,
    cover_image_url: row.cover_image_url ?? null,
  };
}
