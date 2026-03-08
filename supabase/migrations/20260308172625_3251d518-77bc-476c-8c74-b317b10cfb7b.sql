-- Commission slabs: defines commission per service per role
CREATE TABLE public.commission_slabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key text NOT NULL,
  service_label text NOT NULL,
  role app_role NOT NULL,
  commission_type text NOT NULL DEFAULT 'flat',
  commission_value numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_key, role)
);

ALTER TABLE public.commission_slabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access on commission_slabs"
  ON public.commission_slabs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active slabs"
  ON public.commission_slabs FOR SELECT TO authenticated
  USING (is_active = true);

-- Commission logs: tracks every commission credited
CREATE TABLE public.commission_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slab_id uuid REFERENCES public.commission_slabs(id),
  service_key text NOT NULL,
  transaction_amount numeric NOT NULL,
  commission_amount numeric NOT NULL,
  commission_type text NOT NULL,
  commission_value numeric NOT NULL,
  credited boolean NOT NULL DEFAULT false,
  wallet_txn_id uuid REFERENCES public.wallet_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all commission_logs"
  ON public.commission_logs FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own commission_logs"
  ON public.commission_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER set_commission_slabs_updated_at
  BEFORE UPDATE ON public.commission_slabs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default commission slabs
INSERT INTO public.commission_slabs (service_key, service_label, role, commission_type, commission_value) VALUES
  ('aeps_withdrawal', 'AEPS - Cash Withdrawal', 'admin', 'flat', 5),
  ('aeps_withdrawal', 'AEPS - Cash Withdrawal', 'super_distributor', 'flat', 4),
  ('aeps_withdrawal', 'AEPS - Cash Withdrawal', 'master_distributor', 'flat', 3),
  ('aeps_withdrawal', 'AEPS - Cash Withdrawal', 'distributor', 'flat', 2),
  ('aeps_withdrawal', 'AEPS - Cash Withdrawal', 'retailer', 'flat', 1.5),
  ('aeps_balance', 'AEPS - Balance Inquiry', 'admin', 'flat', 1),
  ('aeps_balance', 'AEPS - Balance Inquiry', 'super_distributor', 'flat', 0.80),
  ('aeps_balance', 'AEPS - Balance Inquiry', 'master_distributor', 'flat', 0.60),
  ('aeps_balance', 'AEPS - Balance Inquiry', 'distributor', 'flat', 0.40),
  ('aeps_balance', 'AEPS - Balance Inquiry', 'retailer', 'flat', 0.30),
  ('dmt', 'DMT (per ₹1,000)', 'admin', 'flat', 12),
  ('dmt', 'DMT (per ₹1,000)', 'super_distributor', 'flat', 10),
  ('dmt', 'DMT (per ₹1,000)', 'master_distributor', 'flat', 8),
  ('dmt', 'DMT (per ₹1,000)', 'distributor', 'flat', 6),
  ('dmt', 'DMT (per ₹1,000)', 'retailer', 'flat', 4),
  ('bbps_electricity', 'BBPS - Electricity', 'admin', 'flat', 5),
  ('bbps_electricity', 'BBPS - Electricity', 'super_distributor', 'flat', 4),
  ('bbps_electricity', 'BBPS - Electricity', 'master_distributor', 'flat', 3),
  ('bbps_electricity', 'BBPS - Electricity', 'distributor', 'flat', 2.5),
  ('bbps_electricity', 'BBPS - Electricity', 'retailer', 'flat', 2),
  ('recharge', 'Mobile Recharge', 'admin', 'percent', 3.5),
  ('recharge', 'Mobile Recharge', 'super_distributor', 'percent', 3),
  ('recharge', 'Mobile Recharge', 'master_distributor', 'percent', 2.5),
  ('recharge', 'Mobile Recharge', 'distributor', 'percent', 2),
  ('recharge', 'Mobile Recharge', 'retailer', 'percent', 1.5),
  ('pan', 'PAN Card', 'admin', 'flat', 30),
  ('pan', 'PAN Card', 'super_distributor', 'flat', 25),
  ('pan', 'PAN Card', 'master_distributor', 'flat', 20),
  ('pan', 'PAN Card', 'distributor', 'flat', 15),
  ('pan', 'PAN Card', 'retailer', 'flat', 10),
  ('insurance', 'Insurance Premium', 'admin', 'percent', 2),
  ('insurance', 'Insurance Premium', 'super_distributor', 'percent', 1.8),
  ('insurance', 'Insurance Premium', 'master_distributor', 'percent', 1.5),
  ('insurance', 'Insurance Premium', 'distributor', 'percent', 1.2),
  ('insurance', 'Insurance Premium', 'retailer', 'percent', 1);

ALTER PUBLICATION supabase_realtime ADD TABLE public.commission_logs;