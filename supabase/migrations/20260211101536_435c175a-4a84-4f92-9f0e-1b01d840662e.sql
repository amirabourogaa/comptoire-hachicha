
-- Add image_url, description and show_in_collections to categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS show_in_collections boolean NOT NULL DEFAULT false;
