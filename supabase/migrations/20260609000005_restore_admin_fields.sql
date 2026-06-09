ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS ads_product_daily_price NUMERIC(10,2) DEFAULT 5,
  ADD COLUMN IF NOT EXISTS ads_group_daily_price NUMERIC(10,2) DEFAULT 10,
  ADD COLUMN IF NOT EXISTS ads_left_flyer_daily_price NUMERIC(10,2) DEFAULT 50,
  ADD COLUMN IF NOT EXISTS ads_right_flyer_daily_price NUMERIC(10,2) DEFAULT 50;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins manage affiliates." ON public.affiliates;

  CREATE POLICY "Admins manage affiliates." ON public.affiliates
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());
END $$;
