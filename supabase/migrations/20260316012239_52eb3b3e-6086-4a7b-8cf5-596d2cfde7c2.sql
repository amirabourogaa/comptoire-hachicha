
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specs_pdf_url text DEFAULT NULL;
NOTIFY pgrst, 'reload schema';
