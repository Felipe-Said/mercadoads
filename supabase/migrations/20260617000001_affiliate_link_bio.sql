DROP POLICY IF EXISTS "Public can view active affiliate link bio memberships." ON public.affiliates;
CREATE POLICY "Public can view active affiliate link bio memberships." ON public.affiliates
  FOR SELECT
  USING (status = 'active');
