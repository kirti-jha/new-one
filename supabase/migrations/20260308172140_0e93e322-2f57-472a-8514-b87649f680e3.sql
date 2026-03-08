
-- Wallets table: one wallet per user
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Users can view own wallet
CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all wallets
CREATE POLICY "Admins can view all wallets"
  ON public.wallets FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Admins can update all wallets
CREATE POLICY "Admins can update all wallets"
  ON public.wallets FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Wallet transactions / ledger
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID,
  to_user_id UUID NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'transfer',
  description TEXT,
  reference TEXT,
  from_balance_after NUMERIC(15,2),
  to_balance_after NUMERIC(15,2) NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view transactions they're involved in
CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Uplines can view downline transactions
CREATE POLICY "Uplines can view downline transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = wallet_transactions.to_user_id
      AND is_ancestor_of(auth.uid(), p.id)
    )
  );

-- Auto-create wallet when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.user_id, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_create_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_wallet();

-- Update updated_at on wallets
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for wallets
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
