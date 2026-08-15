import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ProductAttributeValue } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedAttributes?: Record<string, ProductAttributeValue>) => void;
  removeItem: (productId: string, attributeKey?: string) => void;
  updateQuantity: (productId: string, quantity: number, attributeKey?: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  deliveryFee: number;
  freeDeliveryThreshold: number | null;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate a unique key for cart items based on product + selected attributes
function getCartItemKey(productId: string, selectedAttributes?: Record<string, ProductAttributeValue>): string {
  if (!selectedAttributes || Object.keys(selectedAttributes).length === 0) return productId;
  const attrKeys = Object.values(selectedAttributes).map(v => v.id).sort().join('-');
  return `${productId}__${attrKeys}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Fetch delivery settings
  useEffect(() => {
    const fetchDeliverySettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'delivery_settings')
        .single();
      if (data?.value) {
        try {
          const settings = JSON.parse(data.value);
          setDeliveryFee(settings.fee || 0);
          setFreeDeliveryThreshold(settings.freeThreshold || null);
        } catch { /* ignore parse errors */ }
      }
    };
    fetchDeliverySettings();
  }, []);

  const getItemPrice = (item: CartItem): number => {
    // If attributes are selected, check for attribute-specific price
    if (item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0) {
      const attrValues = Object.values(item.selectedAttributes);
      // Use the first attribute value that has a specific price
      const attrWithPrice = attrValues.find(v => v.price != null && v.price > 0);
      if (attrWithPrice) return attrWithPrice.price!;
      // Otherwise use base price + adjustments
      const adjustment = attrValues.reduce((sum, v) => sum + (v.price_adjustment || 0), 0);
      return (item.product.promo_price ?? item.product.price) + adjustment;
    }
    return item.product.promo_price ?? item.product.price;
  };

  const addItem = (product: Product, quantity = 1, selectedAttributes?: Record<string, ProductAttributeValue>) => {
    setItems((prev) => {
      const key = getCartItemKey(product.id, selectedAttributes);
      const existing = prev.find((item) => getCartItemKey(item.product.id, item.selectedAttributes) === key);
      if (existing) {
        return prev.map((item) =>
          getCartItemKey(item.product.id, item.selectedAttributes) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedAttributes }];
    });
  };

  const removeItem = (productId: string, attributeKey?: string) => {
    setItems((prev) => prev.filter((item) => {
      const key = getCartItemKey(item.product.id, item.selectedAttributes);
      if (attributeKey) return key !== attributeKey;
      return item.product.id !== productId;
    }));
  };

  const updateQuantity = (productId: string, quantity: number, attributeKey?: string) => {
    if (quantity <= 0) {
      removeItem(productId, attributeKey);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        const key = getCartItemKey(item.product.id, item.selectedAttributes);
        if (attributeKey) {
          return key === attributeKey ? { ...item, quantity } : item;
        }
        return item.product.id === productId ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const computedDeliveryFee = freeDeliveryThreshold && total >= freeDeliveryThreshold ? 0 : deliveryFee;
  const grandTotal = total + computedDeliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        deliveryFee: computedDeliveryFee,
        freeDeliveryThreshold,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
