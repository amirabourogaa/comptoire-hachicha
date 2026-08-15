-- Add 'vendors' to admin_section enum for marketplace permissions
ALTER TYPE public.admin_section ADD VALUE IF NOT EXISTS 'vendors';