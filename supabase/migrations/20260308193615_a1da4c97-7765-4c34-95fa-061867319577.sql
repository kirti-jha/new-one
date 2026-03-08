
-- Fix the permissive INSERT policy to restrict to authenticated users inserting for themselves
-- Edge functions use service_role which bypasses RLS anyway
DROP POLICY "Service role can insert notifications" ON public.notifications;

-- Admins can insert notifications for anyone
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
