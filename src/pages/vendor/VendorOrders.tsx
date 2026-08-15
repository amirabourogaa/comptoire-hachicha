import { useState } from 'react';
import { Eye, X, Package, ShoppingBag } from 'lucide-react';
import { VendorLayout } from '@/components/vendor/VendorLayout';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { useVendorOrders, VendorOrder } from '@/hooks/useVendorOrders';
import { CURRENCY } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  returned: 'Retournée',
  cancelled: 'Annulée',
};

const statusClasses: Record<string, string> = {
  pending: 'bg-warning-muted text-warning-foreground',
  paid: 'bg-info-muted text-info-foreground',
  shipped: 'bg-accent/20 text-accent-foreground',
  delivered: 'bg-success-muted text-success-foreground',
  returned: 'bg-warning-muted text-warning-foreground',
  cancelled: 'bg-danger-muted text-danger-foreground',
};

export default function VendorOrders() {
  const { vendorInfo } = useVendorAuth();
  const { data: orders, isLoading } = useVendorOrders(vendorInfo?.id || null);
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.vendor_items_total || 0), 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending' || o.status === 'paid').length || 0;

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Mes Commandes</h1>
          <p className="text-muted-foreground">
            Suivez les commandes contenant vos produits
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total commandes</p>
                <p className="text-2xl font-semibold">{totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Package className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenu total</p>
                <p className="text-2xl font-semibold">{CURRENCY.format(totalRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En cours</p>
                <p className="text-2xl font-semibold">{pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : orders && orders.length > 0 ? (
          <div className="bg-card rounded-lg overflow-hidden shadow-sm border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Commande
                  </th>
                  <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Client
                  </th>
                  <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Articles
                  </th>
                  <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Votre part
                  </th>
                  <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Statut
                  </th>
                  <th className="text-right p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{order.items?.length || 0} article(s)</Badge>
                    </td>
                    <td className="p-4 font-medium text-primary">
                      {CURRENCY.format(order.vendor_items_total || 0)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-muted rounded transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-lg border">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucune commande pour le moment</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Les commandes contenant vos produits apparaîtront ici
            </p>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h2 className="font-semibold text-lg">
                  Commande #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-muted rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Statut</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[selectedOrder.status]}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Client</h3>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                  <p className="text-sm">{selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && (
                    <p className="text-sm">{selectedOrder.customer_phone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Adresse de livraison
                  </h3>
                  <p className="text-sm whitespace-pre-line">{selectedOrder.customer_address}</p>
                </div>

                {/* Your Items */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Vos articles dans cette commande
                  </h3>
                  <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product_title} x {item.quantity}
                        </span>
                        <span className="font-medium">{CURRENCY.format(item.product_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-medium pt-3 mt-3 border-t border-border">
                    <span>Votre part</span>
                    <span className="text-primary">{CURRENCY.format(selectedOrder.vendor_items_total || 0)}</span>
                  </div>
                </div>

                {/* Order Total */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total de la commande (tous vendeurs)</span>
                    <span>{CURRENCY.format(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
