-- Create hero slides table
CREATE TABLE public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  button_text TEXT,
  button_link TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Anyone can view active slides
CREATE POLICY "Anyone can view active hero slides" 
ON public.hero_slides 
FOR SELECT 
USING (is_active = true);

-- Authenticated users can view all slides
CREATE POLICY "Authenticated can view all hero slides" 
ON public.hero_slides 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Authenticated users can insert
CREATE POLICY "Authenticated can insert hero slides" 
ON public.hero_slides 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update
CREATE POLICY "Authenticated can update hero slides" 
ON public.hero_slides 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Authenticated users can delete
CREATE POLICY "Authenticated can delete hero slides" 
ON public.hero_slides 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for hero images
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-images', 'hero-images', true);

-- Storage policies
CREATE POLICY "Hero images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'hero-images');

CREATE POLICY "Authenticated can upload hero images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update hero images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete hero images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'hero-images' AND auth.role() = 'authenticated');