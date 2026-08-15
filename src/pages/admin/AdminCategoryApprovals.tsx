import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FolderTree, CheckCircle, XCircle, Store, Clock } from 'lucide-react';

export default function AdminCategoryApprovals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pendingCategories = [], isLoading } = useQuery({
    queryKey: ['pending-categories'],
    queryFn: async () => {
      // Fetch pending categories
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_approved', false)
        .not('vendor_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!categories || categories.length === 0) return [];

      // Fetch parent categories separately
      const parentIds = categories
        .map(c => c.parent_id)
        .filter((id): id is string => id !== null);
      
      const { data: parents } = parentIds.length > 0 
        ? await supabase
            .from('categories')
            .select('id, name, slug')
            .in('id', parentIds)
        : { data: [] };

      // Fetch vendors
      const vendorIds = categories
        .map(c => c.vendor_id)
        .filter((id): id is string => id !== null);
      
      const { data: vendors } = vendorIds.length > 0
        ? await supabase
            .from('vendors')
            .select('id, name, logo_url')
            .in('id', vendorIds)
        : { data: [] };

      // Combine the data
      return categories.map(cat => ({
        ...cat,
        parent: parents?.find(p => p.id === cat.parent_id) || null,
        vendor: vendors?.find(v => v.id === cat.vendor_id) || null,
      }));
    },
  });

  const approveCategoryMutation = useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => {
      const { data, error } = await supabase
        .from('categories')
        .update({ is_approved })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['pending-categories'] });
      toast({
        title: variables.is_approved ? "Catégorie approuvée" : "Catégorie rejetée",
        description: variables.is_approved 
          ? "La catégorie est maintenant visible." 
          : "La catégorie a été rejetée.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la catégorie",
        variant: "destructive",
      });
      console.error('Error:', error);
    },
  });

  const handleApprove = async (id: string) => {
    await approveCategoryMutation.mutateAsync({ id, is_approved: true });
  };

  const handleReject = async (id: string) => {
    // Delete the category instead of just rejecting
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie",
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['pending-categories'] });
      toast({
        title: "Catégorie rejetée",
        description: "La catégorie a été supprimée.",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-light">Approbation des catégories</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Validez ou rejetez les catégories proposées par les vendeurs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Catégories en attente ({pendingCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : pendingCategories.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
                <p className="text-muted-foreground">
                  Aucune catégorie en attente de validation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <FolderTree className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Slug: <code className="bg-muted px-1 rounded">{category.slug}</code>
                          </p>
                          {category.vendor && (
                            <div className="flex items-center gap-2 mt-1">
                              {category.vendor.logo_url ? (
                                <img
                                  src={category.vendor.logo_url}
                                  alt={category.vendor.name}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              ) : (
                                <Store className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {category.vendor.name}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(category.id)}
                            disabled={approveCategoryMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1 text-destructive" />
                            Rejeter
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(category.id)}
                            disabled={approveCategoryMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {category.parent && (
                          <Badge variant="secondary">
                            Parent: {category.parent.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
