-- Add user_id to vendors table to link with Supabase Auth
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add unique constraint on user_id
ALTER TABLE public.vendors ADD CONSTRAINT vendors_user_id_unique UNIQUE (user_id);

-- Add is_approved field to products for admin validation
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- Create vendor role enum
DO $$ BEGIN
    CREATE TYPE public.vendor_role AS ENUM ('vendor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create vendor_roles table for role management
CREATE TABLE IF NOT EXISTS public.vendor_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role vendor_role NOT NULL DEFAULT 'vendor',
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

-- Enable RLS on vendor_roles
ALTER TABLE public.vendor_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user is a vendor
CREATE OR REPLACE FUNCTION public.is_vendor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.vendor_roles
    WHERE user_id = _user_id
  )
$$;

-- Function to get vendor_id from user_id
CREATE OR REPLACE FUNCTION public.get_vendor_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vendor_id
  FROM public.vendor_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for vendor_roles
CREATE POLICY "Admins can manage vendor roles"
ON public.vendor_roles
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Vendors can view their own role"
ON public.vendor_roles
FOR SELECT
USING (user_id = auth.uid());

-- Update products RLS to allow vendors to manage their own products
CREATE POLICY "Vendors can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (
  vendor_id = get_vendor_id(auth.uid())
);

CREATE POLICY "Vendors can update their own products"
ON public.products
FOR UPDATE
USING (vendor_id = get_vendor_id(auth.uid()));

CREATE POLICY "Vendors can delete their own products"
ON public.products
FOR DELETE
USING (vendor_id = get_vendor_id(auth.uid()));

-- Update the active products policy to only show approved products
DROP POLICY IF EXISTS "Active products are viewable by everyone" ON public.products;
CREATE POLICY "Approved active products are viewable by everyone"
ON public.products
FOR SELECT
USING (is_active = true AND is_approved = true);

-- Vendors can see their own products (even unapproved)
CREATE POLICY "Vendors can view their own products"
ON public.products
FOR SELECT
USING (vendor_id = get_vendor_id(auth.uid()));