-- Add promotional price and flash sale columns to products
ALTER TABLE public.products 
ADD COLUMN promo_price numeric NULL,
ADD COLUMN is_flash_sale boolean NOT NULL DEFAULT false;

-- Add index for flash sale products
CREATE INDEX idx_products_flash_sale ON public.products (is_flash_sale) WHERE is_flash_sale = true AND is_active = true;