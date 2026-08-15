import { VendorLayout } from '@/components/vendor/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function VendorDashboard() {
  const { vendorInfo } = useVendorAuth();
  const { data: products = [], isLoading } = useVendorProducts();

  const stats = {
    total: products.length,
    approved: products.filter(p => p.is_approved).length,
    pending: products.filter(p => !p.is_approved && p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
  };

  return (
    <VendorLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Bienvenue, {vendorInfo?.name}</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos produits depuis votre espace dédié
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                Produits dans votre catalogue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {isLoading ? '...' : stats.approved}
              </div>
              <p className="text-xs text-muted-foreground">
                Produits visibles en boutique
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {isLoading ? '...' : stats.pending}
              </div>
              <p className="text-xs text-muted-foreground">
                En attente de validation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stats.inactive}
              </div>
              <p className="text-xs text-muted-foreground">
                Produits désactivés
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Derniers produits</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground">
                Vous n'avez pas encore de produits. Commencez par en ajouter un !
              </p>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.promo_price ? (
                          <>
                            <span className="line-through">{product.price} TND</span>
                            {' '}
                            <span className="text-primary">{product.promo_price} TND</span>
                          </>
                        ) : (
                          `${product.price} TND`
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.is_approved ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-muted text-success-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approuvé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-muted text-warning-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          En attente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}
