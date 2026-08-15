-- Add missing 'unit' column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit text DEFAULT NULL;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';