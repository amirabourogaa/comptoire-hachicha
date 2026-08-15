-- Drop existing restrictive policies on orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

-- Create proper policies for orders - allow anyone to create orders (public checkout)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view orders" 
ON public.orders 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Drop existing restrictive policies on order_items
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;

-- Create proper policies for order_items - allow anyone to create order items
CREATE POLICY "Anyone can create order items" 
ON public.order_items 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view order items" 
ON public.order_items 
FOR SELECT 
TO anon, authenticated
USING (true);