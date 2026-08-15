-- Create vendors table for multi-vendor marketplace
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  description TEXT,
  logo_url TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  address_country TEXT DEFAULT 'Tunisie',
  commission_rate NUMERIC NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  bank_name TEXT,
  account_number TEXT,
  rib TEXT,
  total_products INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor access
CREATE POLICY "Anyone can view active vendors" 
ON public.vendors 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated can view all vendors" 
ON public.vendors 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert vendors" 
ON public.vendors 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update vendors" 
ON public.vendors 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete vendors" 
ON public.vendors 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add vendor_id column to products table for linking products to vendors
ALTER TABLE public.products ADD COLUMN vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL;