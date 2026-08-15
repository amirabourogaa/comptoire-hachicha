-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Public can view approved categories" ON public.categories;

-- Create a new policy that allows:
-- 1. Everyone to see approved categories
-- 2. Admins to see ALL categories (including pending)
-- 3. Vendors to see their own categories (including pending)
CREATE POLICY "Categories visibility policy"
ON public.categories FOR SELECT
USING (
  is_approved = true 
  OR is_admin(auth.uid()) 
  OR vendor_id = get_vendor_id(auth.uid())
);