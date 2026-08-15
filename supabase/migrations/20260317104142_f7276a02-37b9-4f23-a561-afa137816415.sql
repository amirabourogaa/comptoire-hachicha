
-- Add reference/SKU field to product attribute values
ALTER TABLE public.product_attribute_values ADD COLUMN IF NOT EXISTS reference text DEFAULT NULL;

-- Add price field to product attribute values (absolute price, not just adjustment)
ALTER TABLE public.product_attribute_values ADD COLUMN IF NOT EXISTS price numeric DEFAULT NULL;

NOTIFY pgrst, 'reload schema';
