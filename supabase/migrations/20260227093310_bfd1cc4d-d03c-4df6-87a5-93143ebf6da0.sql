
-- Add product_type column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'simple';

-- Create product_attributes table (custom variant types per product)
CREATE TABLE public.product_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create product_attribute_values table (values for each attribute)
CREATE TABLE public.product_attribute_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id uuid NOT NULL REFERENCES public.product_attributes(id) ON DELETE CASCADE,
  value text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  color_code text,
  price_adjustment numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_attributes
CREATE POLICY "Product attributes viewable by everyone" ON public.product_attributes FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert product attributes" ON public.product_attributes FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update product attributes" ON public.product_attributes FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete product attributes" ON public.product_attributes FOR DELETE USING (true);

-- RLS policies for product_attribute_values
CREATE POLICY "Product attribute values viewable by everyone" ON public.product_attribute_values FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert product attribute values" ON public.product_attribute_values FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update product attribute values" ON public.product_attribute_values FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete product attribute values" ON public.product_attribute_values FOR DELETE USING (true);
