-- Company bank accounts set by admin
CREATE TABLE public.company_bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  ifsc_code text NOT NULL,
  upi_id text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_bank_accounts ENABLE ROW LEVEL SECURITY;

-- All authenticated can view active accounts
CREATE POLICY "Authenticated can view active bank accounts"
  ON public.company_bank_accounts FOR SELECT TO authenticated
  USING (is_active = true);

-- Admins full access
CREATE POLICY "Admins full access bank accounts"
  ON public.company_bank_accounts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_bank_accounts_updated_at
  BEFORE UPDATE ON public.company_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fund requests
CREATE TABLE public.fund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  bank_account_id uuid REFERENCES public.company_bank_accounts(id) NOT NULL,
  amount numeric NOT NULL,
  payment_mode text NOT NULL DEFAULT 'bank_transfer',
  payment_reference text NOT NULL,
  payment_date date NOT NULL,
  receipt_path text,
  receipt_name text,
  remarks text,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  rejection_reason text,
  wallet_txn_id uuid REFERENCES public.wallet_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fund_requests ENABLE ROW LEVEL SECURITY;

-- Users can view own requests
CREATE POLICY "Users can view own fund_requests"
  ON public.fund_requests FOR SELECT TO authenticated
  USING (requester_id = auth.uid());

-- Users can insert own requests
CREATE POLICY "Users can insert own fund_requests"
  ON public.fund_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());

-- Admins full access
CREATE POLICY "Admins full access fund_requests"
  ON public.fund_requests FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Uplines can view downline requests
CREATE POLICY "Uplines can view downline fund_requests"
  ON public.fund_requests FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = fund_requests.requester_id
    AND is_ancestor_of(auth.uid(), p.id)
  ));

-- Uplines can update downline requests (approve/reject)
CREATE POLICY "Uplines can update downline fund_requests"
  ON public.fund_requests FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = fund_requests.requester_id
    AND is_ancestor_of(auth.uid(), p.id)
  ));

CREATE TRIGGER set_fund_requests_updated_at
  BEFORE UPDATE ON public.fund_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false);

CREATE POLICY "Users can upload own receipts"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all receipts"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-receipts' AND has_role(auth.uid(), 'admin'));

-- Uplines can view downline receipts via a function
CREATE OR REPLACE FUNCTION public.can_view_receipt(_user_id uuid, _folder_owner text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = _folder_owner::uuid
    AND is_ancestor_of(_user_id, p.id)
  )
$$;

CREATE POLICY "Uplines can view downline receipts"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-receipts' AND can_view_receipt(auth.uid(), (storage.foldername(name))[1]));

ALTER PUBLICATION supabase_realtime ADD TABLE public.fund_requests;