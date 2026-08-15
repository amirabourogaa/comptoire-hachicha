-- Create testimonials table for customer reviews
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_role TEXT,
  customer_avatar TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create features table for homepage features section
CREATE TABLE public.features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'star',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create partners/brands table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stats table for homepage statistics
CREATE TABLE public.stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT DEFAULT 'trending-up',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Testimonials policies
CREATE POLICY "Active testimonials are viewable by everyone" 
ON public.testimonials FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated can view all testimonials" 
ON public.testimonials FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert testimonials" 
ON public.testimonials FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update testimonials" 
ON public.testimonials FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete testimonials" 
ON public.testimonials FOR DELETE USING (auth.role() = 'authenticated');

-- Features policies
CREATE POLICY "Active features are viewable by everyone" 
ON public.features FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated can view all features" 
ON public.features FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert features" 
ON public.features FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update features" 
ON public.features FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete features" 
ON public.features FOR DELETE USING (auth.role() = 'authenticated');

-- Partners policies
CREATE POLICY "Active partners are viewable by everyone" 
ON public.partners FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated can view all partners" 
ON public.partners FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert partners" 
ON public.partners FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update partners" 
ON public.partners FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete partners" 
ON public.partners FOR DELETE USING (auth.role() = 'authenticated');

-- Stats policies
CREATE POLICY "Active stats are viewable by everyone" 
ON public.stats FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated can view all stats" 
ON public.stats FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert stats" 
ON public.stats FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update stats" 
ON public.stats FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete stats" 
ON public.stats FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default data for features
INSERT INTO public.features (title, description, icon, display_order) VALUES
('Livraison Gratuite', 'Livraison offerte dès 50€ d''achat', 'truck', 1),
('Paiement Sécurisé', 'Vos transactions sont 100% sécurisées', 'shield', 2),
('Retours Faciles', 'Retours gratuits sous 30 jours', 'refresh-cw', 3),
('Support 24/7', 'Notre équipe est à votre écoute', 'headphones', 4);

-- Insert default stats
INSERT INTO public.stats (label, value, icon, display_order) VALUES
('Clients Satisfaits', '10K+', 'users', 1),
('Produits', '500+', 'package', 2),
('Années d''Expérience', '15+', 'award', 3),
('Livraisons', '50K+', 'truck', 4);