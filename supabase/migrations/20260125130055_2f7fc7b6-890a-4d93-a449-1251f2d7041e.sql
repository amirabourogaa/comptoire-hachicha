-- Add About section settings for homepage
INSERT INTO public.site_settings (key, value) VALUES 
  ('about_title', 'Notre Histoire'),
  ('about_subtitle', 'Une passion pour la mode'),
  ('about_description', 'Depuis notre création, nous nous engageons à vous offrir des vêtements de qualité, alliant style contemporain et élégance intemporelle. Chaque pièce est sélectionnée avec soin pour vous accompagner dans tous les moments de votre vie.'),
  ('about_image', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80'),
  ('about_button_text', 'En savoir plus'),
  ('about_button_link', '/category/nouveautes')
ON CONFLICT (key) DO NOTHING;