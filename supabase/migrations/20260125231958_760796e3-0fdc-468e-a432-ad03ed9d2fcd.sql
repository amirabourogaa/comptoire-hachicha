-- Add show_in_navbar column to categories table
ALTER TABLE public.categories ADD COLUMN show_in_navbar BOOLEAN NOT NULL DEFAULT false;

-- Update existing parent categories to show in navbar by default
UPDATE public.categories SET show_in_navbar = true WHERE parent_id IS NULL;