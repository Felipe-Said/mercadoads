DROP POLICY IF EXISTS "Users view own affiliate memberships." ON public.affiliates;
CREATE POLICY "Users view own affiliate memberships." ON public.affiliates
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sellers view own affiliate network." ON public.affiliates;
CREATE POLICY "Sellers view own affiliate network." ON public.affiliates
  FOR SELECT
  USING (auth.uid() = seller_id OR public.is_admin());
