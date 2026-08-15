export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  vendor_id: string | null;
  is_approved: boolean;
  show_in_navbar: boolean;
  show_in_collections?: boolean;
  image_url?: string | null;
  description?: string | null;
  created_at: string;
  parent?: Category;
  children?: Category[];
}

export interface ProductSize {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  created_at: string;
}

export interface ProductColor {
  id: string;
  product_id: string;
  color_name: string;
  color_code: string | null;
  image_url: string;
  created_at: string;
}

export interface ProductAttribute {
  id: string;
  product_id: string;
  name: string;
  display_order: number;
  created_at: string;
  values?: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  stock: number;
  image_url: string | null;
  color_code: string | null;
  price_adjustment: number;
  price: number | null;
  reference: string | null;
  created_at: string;
}

export type ProductType = 'simple' | 'variable';

export interface ProductVendor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  description: string | null;
  logo_url: string | null;
  address_city: string | null;
  address_country: string | null;
  is_verified: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  promo_price: number | null;
  is_flash_sale: boolean;
  image_url: string | null;
  images: string[];
  category_id: string | null;
  vendor_id: string | null;
  is_active: boolean;
  is_approved: boolean;
  product_type: ProductType;
  unit?: string | null;
  specs_pdf_url?: string | null;
  details_content?: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  vendor?: ProductVendor;
  sizes?: ProductSize[];
  colors?: ProductColor[];
  attributes?: ProductAttribute[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  product_price: number;
  quantity: number;
  created_at: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'returned' | 'cancelled';

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string | null;
  total_amount: number;
  status: OrderStatus;
  coupon_code: string | null;
  discount_amount: number;
  payment_method?: string;
  payment_status?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedAttributes?: Record<string, ProductAttributeValue>;
}

export interface DeliverySettings {
  fee: number;
  freeThreshold: number | null;
  enabled: boolean;
}

// Currency configuration
export const CURRENCY = {
  code: 'TND',
  symbol: 'TND',
  format: (amount: number) => `${amount.toFixed(3)} TND`,
};
