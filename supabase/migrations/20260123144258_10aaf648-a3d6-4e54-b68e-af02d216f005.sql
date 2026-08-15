-- Insert company contact settings if they don't exist
INSERT INTO public.site_settings (key, value)
VALUES 
  ('company_email', null),
  ('company_phone', null),
  ('company_address', null),
  ('company_name', 'ATELIER')
ON CONFLICT (key) DO NOTHING;