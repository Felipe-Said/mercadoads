ALTER TABLE public.affiliates
  DROP CONSTRAINT IF EXISTS affiliates_status_check;

ALTER TABLE public.affiliates
  ADD CONSTRAINT affiliates_status_check
  CHECK (status IN ('pending', 'active', 'inactive'));

DROP POLICY IF EXISTS "Users accept own affiliate invitations." ON public.affiliates;
CREATE POLICY "Users accept own affiliate invitations." ON public.affiliates
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'active');
