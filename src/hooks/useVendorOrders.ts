import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types';

export interface VendorOrderItem extends OrderItem {
  product?: {
    id: string;
    title: string;
    vendor_id: string | null;
  };
}

export interface VendorOrder extends Omit<Order, 'items'> {
  items?: VendorOrderItem[];
  vendor_items_total?: number;
}

// Get orders for a specific vendor (only items belonging to them)
export function useVendorOrders(vendorId: string | null) {
  return useQuery({
    queryKey: ['vendor-orders', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];

      // Get all order items that contain products from this vendor
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products!order_items_product_id_fkey(id, title, vendor_id),
          order:orders!order_items_order_id_fkey(*)
        `)
        .not('product_id', 'is', null);

      if (itemsError) throw itemsError;

      // Filter items that belong to this vendor
      const vendorItems = orderItems?.filter(
        (item: any) => item.product?.vendor_id === vendorId
      ) || [];

      // Group items by order
      const ordersMap = new Map<string, VendorOrder>();
      
      for (const item of vendorItems) {
        const order = item.order;
        if (!order) continue;

        if (!ordersMap.has(order.id)) {
          ordersMap.set(order.id, {
            ...order,
            items: [],
            vendor_items_total: 0,
          });
        }

        const vendorOrder = ordersMap.get(order.id)!;
        vendorOrder.items!.push({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          product_title: item.product_title,
          product_price: item.product_price,
          quantity: item.quantity,
          created_at: item.created_at,
          product: item.product,
        });
        vendorOrder.vendor_items_total! += item.product_price * item.quantity;
      }

      // Convert to array and sort by date
      return Array.from(ordersMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!vendorId,
  });
}

// Get all orders with vendor information for admin
export function useOrdersWithVendors() {
  return useQuery({
    queryKey: ['orders-with-vendors'],
    queryFn: async () => {
      // Get all orders with items and their product vendor info
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get all order items with product and vendor info
      const { data: allItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products!order_items_product_id_fkey(
            id, 
            title, 
            vendor_id,
            vendor:vendors!products_vendor_id_fkey(id, name, logo_url)
          )
        `);

      if (itemsError) throw itemsError;

      // Map items to orders with vendor info
      const ordersWithVendors = orders?.map((order) => {
        const orderItems = allItems?.filter((item: any) => item.order_id === order.id) || [];
        
        // Get unique vendors for this order
        const vendorsSet = new Map<string, { id: string; name: string; logo_url: string | null }>();
        for (const item of orderItems) {
          if (item.product?.vendor) {
            vendorsSet.set(item.product.vendor.id, item.product.vendor);
          }
        }

        return {
          ...order,
          items: orderItems.map((item: any) => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            product_title: item.product_title,
            product_price: item.product_price,
            quantity: item.quantity,
            created_at: item.created_at,
            vendor: item.product?.vendor || null,
          })),
          vendors: Array.from(vendorsSet.values()),
        };
      }) || [];

      return ordersWithVendors;
    },
  });
}
