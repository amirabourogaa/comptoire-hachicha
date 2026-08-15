import { useState } from 'react';
import { Eye, X, Store, Filter } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useOrdersWithVendors } from '@/hooks/useVendorOrders';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { useVendors } from '@/hooks/useVendors';
import { OrderStatus, CURRENCY } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  returned: 'Retournée',
  cancelled: 'Annulée',
};

const statusClasses: Record<OrderStatus, string> = {
  pending: 'badge-pending',
  paid: 'badge-paid',
  shipped: 'badge-shipped',
  delivered: 'badge-delivered',
  returned: 'badge-returned',
  cancelled: 'badge-cancelled',
};

interface OrderWithVendors {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  items: Array<{
    id: string;
    product_title: string;
    product_price: number;
    quantity: number;
    vendor: { id: string; name: string; logo_url: string | null } | null;
  }>;
  vendors: Array<{ id: string; name: string; logo_url: string | null }>;
}

const AdminOrders = () => {
  const { data: orders, isLoading } = useOrdersWithVendors();
  const { data: vendors } = useVendors();
  const updateStatus = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<OrderWithVendors | null>(null);
  const [vendorFilter, setVendorFilter] = useState<string>('all');

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  // Filter orders by vendor
  const filteredOrders = orders?.filter((order: OrderWithVendors) => {
    if (vendorFilter === 'all') return true;
    if (vendorFilter === 'no-vendor') {
      return order.vendors.length === 0;
    }
    return order.vendors.some(v => v.id === vendorFilter);
  }) || [];

  // Group items by vendor in selected order
  const getItemsByVendor = (order: OrderWithVendors) => {
    const vendorGroups = new Map<string, { vendor: { id: string; name: string; logo_url: string | null } | null; items: typeof order.items }>();
    
    for (const item of order.items) {
      const vendorId = item.vendor?.id || 'no-vendor';
      if (!vendorGroups.has(vendorId)) {
        vendorGroups.set(vendorId, {
          vendor: item.vendor,
          items: [],
        });
      }
      vendorGroups.get(vendorId)!.items.push(item);
    }
    
    return Array.from(vendorGroups.values());
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-light">Commandes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gérez toutes les commandes et suivez les vendeurs
          </p>
        </div>

        {/* Vendor Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par vendeur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les vendeurs</SelectItem>
              <SelectItem value="no-vendor">Sans vendeur (admin)</SelectItem>
              {vendors?.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-card rounded-lg overflow-hidden shadow-soft">
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
                  Vendeur(s)
                </th>
                <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Date
                </th>
                <th className="text-left p-4 text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  Total
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
              {filteredOrders.map((order: OrderWithVendors) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="p-4 font-medium">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    {order.vendors.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {order.vendors.slice(0, 3).map((vendor) => (
                          <div key={vendor.id} className="flex items-center gap-1.5">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={vendor.logo_url || undefined} />
                              <AvatarFallback className="text-[10px] bg-primary/10">
                                {vendor.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{vendor.name}</span>
                          </div>
                        ))}
                        {order.vendors.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{order.vendors.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Store className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="p-4">{CURRENCY.format(order.total_amount)}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`${statusClasses[order.status]} border-0 cursor-pointer`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
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
        <div className="text-center py-16 bg-card rounded-lg">
          <p className="text-muted-foreground">Aucune commande</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="font-serif text-xl font-light">
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

              {/* Items grouped by vendor */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Articles par vendeur
                </h3>
                <div className="space-y-4">
                  {getItemsByVendor(selectedOrder).map((group, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      {/* Vendor Header */}
                      <div className="bg-muted/50 px-4 py-2 flex items-center gap-2">
                        {group.vendor ? (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={group.vendor.logo_url || undefined} />
                              <AvatarFallback className="text-[10px]">
                                {group.vendor.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{group.vendor.name}</span>
                          </>
                        ) : (
                          <>
                            <Store className="h-4 w-4" />
                            <span className="font-medium text-sm">Produits Admin</span>
                          </>
                        )}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {group.items.length} article(s)
                        </Badge>
                      </div>
                      
                      {/* Items */}
                      <div className="p-4 space-y-2">
                        {group.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.product_title} x {item.quantity}
                            </span>
                            <span>{CURRENCY.format(item.product_price * item.quantity)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-medium pt-2 mt-2 border-t border-border text-sm">
                          <span>Sous-total</span>
                          <span>
                            {CURRENCY.format(
                              group.items.reduce((sum, item) => sum + item.product_price * item.quantity, 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-medium pt-4 mt-4 border-t border-border">
                  <span>Total de la commande</span>
                  <span>{CURRENCY.format(selectedOrder.total_amount)}</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Statut</h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value as OrderStatus });
                  }}
                  className="input-elegant"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
