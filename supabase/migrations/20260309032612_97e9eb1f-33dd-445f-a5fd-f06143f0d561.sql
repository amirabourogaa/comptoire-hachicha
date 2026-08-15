
CREATE TABLE public.custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can view published pages
CREATE POLICY "Published pages viewable by everyone"
  ON public.custom_pages FOR SELECT
  USING (is_published = true);

-- Authenticated (admins) can view all pages
CREATE POLICY "Authenticated can view all pages"
  ON public.custom_pages FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated can insert pages
CREATE POLICY "Authenticated can insert pages"
  ON public.custom_pages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated can update pages
CREATE POLICY "Authenticated can update pages"
  ON public.custom_pages FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated can delete pages
CREATE POLICY "Authenticated can delete pages"
  ON public.custom_pages FOR DELETE
  TO authenticated
  USING (true);

-- Auto-update updated_at
CREATE TRIGGER update_custom_pages_updated_at
  BEFORE UPDATE ON public.custom_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
