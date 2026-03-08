
-- User-level commission/charge overrides set by uplines for their downline
CREATE TABLE public.user_commission_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_by uuid NOT NULL,
  target_user_id uuid NOT NULL,
  service_key text NOT NULL,
  service_label text NOT NULL DEFAULT '',
  commission_type text NOT NULL DEFAULT 'flat',
  commission_value numeric NOT NULL DEFAULT 0,
  charge_type text NOT NULL DEFAULT 'flat',
  charge_value numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(target_user_id, service_key)
);

ALTER TABLE public.user_commission_overrides ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins full access user_commission_overrides"
ON public.user_commission_overrides FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Uplines can manage overrides for their downline
CREATE POLICY "Uplines can manage downline commission overrides"
ON public.user_commission_overrides FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = user_commission_overrides.target_user_id
    AND public.is_ancestor_of(auth.uid(), p.id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = user_commission_overrides.target_user_id
    AND public.is_ancestor_of(auth.uid(), p.id)
  )
);

-- Users can view their own overrides
CREATE POLICY "Users can view own commission overrides"
ON public.user_commission_overrides FOR SELECT
USING (target_user_id = auth.uid());

-- Updated at trigger
CREATE TRIGGER update_user_commission_overrides_updated_at
  BEFORE UPDATE ON public.user_commission_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
