
-- Add master admin flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_master_admin boolean NOT NULL DEFAULT false;

-- Staff permissions table
CREATE TABLE public.staff_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  can_manage_users boolean NOT NULL DEFAULT true,
  can_manage_finances boolean NOT NULL DEFAULT true,
  can_manage_commissions boolean NOT NULL DEFAULT true,
  can_manage_services boolean NOT NULL DEFAULT true,
  can_manage_settings boolean NOT NULL DEFAULT false,
  can_manage_security boolean NOT NULL DEFAULT false,
  can_view_reports boolean NOT NULL DEFAULT true,
  granted_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can access staff_permissions
CREATE POLICY "Admins full access staff_permissions"
ON public.staff_permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can view own permissions
CREATE POLICY "Users can view own staff_permissions"
ON public.staff_permissions FOR SELECT
USING (user_id = auth.uid());

-- Updated at trigger
CREATE TRIGGER update_staff_permissions_updated_at
  BEFORE UPDATE ON public.staff_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mark the bootstrap admin (first admin) as master
UPDATE public.profiles
SET is_master_admin = true
WHERE user_id = (
  SELECT ur.user_id FROM public.user_roles ur
  WHERE ur.role = 'admin'
  ORDER BY (SELECT created_at FROM auth.users WHERE id = ur.user_id) ASC
  LIMIT 1
);

-- Helper function to check if user is master admin
CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND is_master_admin = true
  )
$$;

-- Helper function to check staff permission
CREATE OR REPLACE FUNCTION public.has_staff_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    -- Master admin has all permissions
    WHEN EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _user_id AND is_master_admin = true) THEN true
    -- Non-admin roles don't use staff permissions
    WHEN NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN false
    -- Check specific permission
    ELSE COALESCE(
      (SELECT
        CASE _permission
          WHEN 'manage_users' THEN can_manage_users
          WHEN 'manage_finances' THEN can_manage_finances
          WHEN 'manage_commissions' THEN can_manage_commissions
          WHEN 'manage_services' THEN can_manage_services
          WHEN 'manage_settings' THEN can_manage_settings
          WHEN 'manage_security' THEN can_manage_security
          WHEN 'view_reports' THEN can_view_reports
          ELSE false
        END
      FROM public.staff_permissions WHERE user_id = _user_id),
      true  -- If no permissions row exists, default to full access
    )
  END
$$;
