
-- Global service configuration (admin controls)
CREATE TABLE public.service_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key text NOT NULL UNIQUE,
  service_label text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  icon_name text,
  route_path text NOT NULL,
  section text NOT NULL DEFAULT 'Services',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Per-user service overrides (upline can disable for specific user)
CREATE TABLE public.user_service_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_key text NOT NULL REFERENCES public.service_config(service_key) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT false,
  disabled_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_key)
);

-- RLS for service_config
ALTER TABLE public.service_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read service_config"
  ON public.service_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage service_config"
  ON public.service_config FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS for user_service_overrides
ALTER TABLE public.user_service_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own overrides"
  ON public.user_service_overrides FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins full access overrides"
  ON public.user_service_overrides FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Uplines can manage downline overrides"
  ON public.user_service_overrides FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = user_service_overrides.user_id
    AND is_ancestor_of(auth.uid(), p.id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = user_service_overrides.user_id
    AND is_ancestor_of(auth.uid(), p.id)
  ));

-- Seed default services
INSERT INTO public.service_config (service_key, service_label, route_path, section) VALUES
  ('aeps', 'AEPS', '/dashboard/aeps', 'Services'),
  ('bbps', 'BBPS', '/dashboard/bbps', 'Services'),
  ('dmt', 'DMT', '/dashboard/dmt', 'Services'),
  ('recharge', 'Recharge', '/dashboard/recharge', 'Services'),
  ('loan', 'Loan', '/dashboard/loan', 'Services'),
  ('credit_card', 'Credit Card', '/dashboard/credit-card', 'Services'),
  ('cc_bill_pay', 'CC Bill Pay', '/dashboard/cc-bill-pay', 'Services'),
  ('payout', 'Payout', '/dashboard/payout', 'Services'),
  ('matm', 'MATM', '/dashboard/matm', 'Services'),
  ('bank_account', 'Bank Account', '/dashboard/bank-account', 'Services'),
  ('pan', 'PAN Apply', '/dashboard/pan', 'Services'),
  ('ppi_wallet', 'PPI Wallet', '/dashboard/ppi-wallet', 'Services'),
  ('travel_booking', 'Travel Booking', '/dashboard/travel-booking', 'Services'),
  ('travel_package', 'Travel Package', '/dashboard/travel-package', 'Services'),
  ('insurance', 'Insurance', '/dashboard/insurance', 'Services'),
  ('pg', 'Payment Gateway', '/dashboard/pg', 'Services'),
  ('pos', 'POS Machine', '/dashboard/pos', 'Services'),
  ('sound_box', 'Sound Box', '/dashboard/sound-box', 'Services');

-- Trigger for updated_at
CREATE TRIGGER update_service_config_updated_at
  BEFORE UPDATE ON public.service_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
