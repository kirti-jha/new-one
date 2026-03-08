
-- Add e_wallet_balance to wallets table
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS e_wallet_balance numeric NOT NULL DEFAULT 0.00;

-- Create e_wallet_credits table for per-credit cooldown tracking
CREATE TABLE public.e_wallet_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  available_at timestamp with time zone NOT NULL,
  consumed boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'commission',
  reference_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX idx_ewallet_credits_user ON public.e_wallet_credits(user_id, consumed, available_at);

-- RLS
ALTER TABLE public.e_wallet_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own e_wallet_credits"
  ON public.e_wallet_credits FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins full access e_wallet_credits"
  ON public.e_wallet_credits FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for wallets
ALTER PUBLICATION supabase_realtime ADD TABLE public.e_wallet_credits;
