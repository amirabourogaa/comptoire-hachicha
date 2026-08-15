-- Add vendor_id and is_approved to categories for vendor category submission
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT true;

-- Add foreign key constraint
ALTER TABLE public.categories 
DROP CONSTRAINT IF EXISTS categories_vendor_id_fkey;

ALTER TABLE public.categories 
ADD CONSTRAINT categories_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;

-- Update RLS policies for categories to handle vendor submissions

-- Drop existing policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Authenticated can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated can update categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated can delete categories" ON public.categories;

-- Public can only view approved categories
CREATE POLICY "Approved categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (is_approved = true);

-- Authenticated users (admins) can view all categories
CREATE POLICY "Authenticated can view all categories" 
ON public.categories 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Vendors can insert their own categories (pending approval)
CREATE POLICY "Vendors can insert their own categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (vendor_id = get_vendor_id(auth.uid()));

-- Admins can insert categories
CREATE POLICY "Admins can insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Vendors can update their own categories
CREATE POLICY "Vendors can update their own categories" 
ON public.categories 
FOR UPDATE 
USING (vendor_id = get_vendor_id(auth.uid()));

-- Admins can update any categories
CREATE POLICY "Admins can update categories" 
ON public.categories 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Vendors can delete their own unapproved categories
CREATE POLICY "Vendors can delete their own categories" 
ON public.categories 
FOR DELETE 
USING (vendor_id = get_vendor_id(auth.uid()) AND is_approved = false);

-- Admins can delete any categories
CREATE POLICY "Admins can delete categories" 
ON public.categories 
FOR DELETE 
USING (is_admin(auth.uid()));