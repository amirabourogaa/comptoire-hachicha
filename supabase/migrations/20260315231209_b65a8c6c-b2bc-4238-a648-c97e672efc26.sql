
ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS show_in_navbar boolean NOT NULL DEFAULT false;
ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS navbar_label text;
