ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS cover_image_url text DEFAULT NULL;
NOTIFY pgrst, 'reload schema';