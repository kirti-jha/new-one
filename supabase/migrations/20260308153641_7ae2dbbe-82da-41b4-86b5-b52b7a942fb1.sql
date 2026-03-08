
CREATE OR REPLACE FUNCTION public.role_level(_role app_role)
RETURNS INT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _role
    WHEN 'admin' THEN 1
    WHEN 'super_distributor' THEN 2
    WHEN 'master_distributor' THEN 3
    WHEN 'distributor' THEN 4
    WHEN 'retailer' THEN 5
  END
$$;
