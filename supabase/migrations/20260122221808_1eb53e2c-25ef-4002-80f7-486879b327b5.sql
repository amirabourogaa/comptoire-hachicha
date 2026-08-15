-- Create product_sizes table for available sizes
CREATE TABLE public.product_sizes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create product_colors table for colors with images
CREATE TABLE public.product_colors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_name text NOT NULL,
  color_code text, -- hex code for display
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_sizes
CREATE POLICY "Product sizes are viewable by everyone" 
ON public.product_sizes FOR SELECT 
USING (true);

CREATE POLICY "Authenticated can insert product sizes" 
ON public.product_sizes FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated can update product sizes" 
ON public.product_sizes FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated can delete product sizes" 
ON public.product_sizes FOR DELETE 
USING (true);

-- RLS policies for product_colors
CREATE POLICY "Product colors are viewable by everyone" 
ON public.product_colors FOR SELECT 
USING (true);

CREATE POLICY "Authenticated can insert product colors" 
ON public.product_colors FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated can update product colors" 
ON public.product_colors FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated can delete product colors" 
ON public.product_colors FOR DELETE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_product_sizes_product_id ON public.product_sizes(product_id);
CREATE INDEX idx_product_colors_product_id ON public.product_colors(product_id);