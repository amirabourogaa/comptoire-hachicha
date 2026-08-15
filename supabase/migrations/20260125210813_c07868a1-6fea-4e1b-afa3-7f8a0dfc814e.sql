-- Create vendor_messages table for contact form submissions
CREATE TABLE public.vendor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_messages ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can send a message
CREATE POLICY "Anyone can send vendor messages"
ON public.vendor_messages FOR INSERT
WITH CHECK (true);

-- Admins can view all messages
CREATE POLICY "Admins can view all vendor messages"
ON public.vendor_messages FOR SELECT
USING (is_admin(auth.uid()));

-- Vendors can view their own messages
CREATE POLICY "Vendors can view their own messages"
ON public.vendor_messages FOR SELECT
USING (vendor_id = get_vendor_id(auth.uid()));

-- Vendors can update their own messages (mark as read)
CREATE POLICY "Vendors can update their own messages"
ON public.vendor_messages FOR UPDATE
USING (vendor_id = get_vendor_id(auth.uid()));

-- Admins can update any message
CREATE POLICY "Admins can update vendor messages"
ON public.vendor_messages FOR UPDATE
USING (is_admin(auth.uid()));

-- Admins can delete messages
CREATE POLICY "Admins can delete vendor messages"
ON public.vendor_messages FOR DELETE
USING (is_admin(auth.uid()));