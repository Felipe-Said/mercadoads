ALTER TABLE public.marketing_banners ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Public banners are viewable." ON public.marketing_banners;
DROP POLICY IF EXISTS "Admins manage banners." ON public.marketing_banners;

CREATE POLICY "Public banners are viewable." ON public.marketing_banners
  FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage banners." ON public.marketing_banners
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
