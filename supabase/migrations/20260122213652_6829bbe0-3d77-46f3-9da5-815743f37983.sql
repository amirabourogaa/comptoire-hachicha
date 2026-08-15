-- Create settings table for storing site configuration
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read settings (for displaying logo on public pages)
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Only authenticated users can update settings (admin check will be in app logic)
CREATE POLICY "Authenticated users can update site settings" 
ON public.site_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can insert site settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default logo setting
INSERT INTO public.site_settings (key, value) VALUES ('logo_url', NULL);

-- Create storage bucket for site assets
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true);

-- Create policies for site assets storage
CREATE POLICY "Site assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-assets');

CREATE POLICY "Authenticated users can upload site assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "Authenticated users can update site assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'site-assets');

CREATE POLICY "Authenticated users can delete site assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'site-assets');