-- Create coupons table
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  minimum_amount NUMERIC DEFAULT 0,
  maximum_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Public can view active coupons (for validation)
CREATE POLICY "Anyone can view active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true);

-- Authenticated users can manage coupons
CREATE POLICY "Authenticated can view all coupons"
ON public.coupons
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert coupons"
ON public.coupons
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update coupons"
ON public.coupons
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete coupons"
ON public.coupons
FOR DELETE
USING (auth.role() = 'authenticated');

-- Add coupon reference to orders
ALTER TABLE public.orders
ADD COLUMN coupon_code TEXT,
ADD COLUMN discount_amount NUMERIC DEFAULT 0;

-- Create index for faster code lookups
CREATE INDEX idx_coupons_code ON public.coupons(code);

-- Add trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();