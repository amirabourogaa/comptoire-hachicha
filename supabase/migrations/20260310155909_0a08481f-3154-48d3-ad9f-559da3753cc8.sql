
-- Payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TND',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  gateway_name TEXT,
  gateway_transaction_id TEXT,
  gateway_response JSONB,
  customer_name TEXT,
  customer_email TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view all transactions" ON public.payment_transactions
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update transactions" ON public.payment_transactions
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can insert transactions" ON public.payment_transactions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view own transaction by order" ON public.payment_transactions
  FOR SELECT TO anon, authenticated USING (true);

-- Add payment_status to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';

-- Updated_at trigger
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
