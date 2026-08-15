import { useQuery } from '@tanstack/react-query';
import { sanitizeRichTextHtml } from '@/lib/sanitizeRichTextHtml';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useApproveProduct } from '@/hooks/useVendorAdmin';
import { Package, CheckCircle, XCircle, Store, Clock } from 'lucide-react';

export default function AdminProductApprovals() {
  const { data: pendingProducts = [], isLoading } = useQuery({
    queryKey: ['pending-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug),
          vendor:vendors(id, name, logo_url)
        `)
        .eq('is_approved', false)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const approveProduct = useApproveProduct();

  const handleApprove = async (id: string) => {
    await approveProduct.mutateAsync({ id, is_approved: true });
  };

  const handleReject = async (id: string) => {
    await approveProduct.mutateAsync({ id, is_approved: false });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-light">Approbation des produits</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Validez ou rejetez les produits soumis par les vendeurs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Produits en attente ({pendingProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : pendingProducts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
                <p className="text-muted-foreground">
                  Aucun produit en attente de validation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{product.title}</h3>
                          {product.vendor && (
                            <div className="flex items-center gap-2 mt-1">
                              {product.vendor.logo_url ? (
                                <img
                                  src={product.vendor.logo_url}
                                  alt={product.vendor.name}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                              ) : (
                                <Store className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {product.vendor.name}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(product.id)}
                            disabled={approveProduct.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1 text-destructive" />
                            Rejeter
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(product.id)}
                            disabled={approveProduct.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.category && (
                          <Badge variant="secondary">
                            {product.category.name}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {product.promo_price ? (
                            <>
                              <span className="line-through mr-1">{product.price}</span>
                              {product.promo_price} TND
                            </>
                          ) : (
                            `${product.price} TND`
                          )}
                        </Badge>
                        {product.is_flash_sale && (
                          <Badge className="bg-destructive/10 text-destructive">
                            Vente flash
                          </Badge>
                        )}
                      </div>

                      {product.description && (
                        <div className="mt-2 text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none [&_p]:my-0" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(product.description) }} />
                      )}
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
