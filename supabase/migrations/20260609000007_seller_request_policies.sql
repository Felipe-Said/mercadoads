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

GRANT INSERT, SELECT ON public.seller_requests TO anon, authenticated;
GRANT UPDATE ON public.seller_requests TO authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class
    WHERE oid = pg_get_serial_sequence('public.seller_requests', 'id')::regclass
  ) THEN
    GRANT USAGE, SELECT ON SEQUENCE public.seller_requests_id_seq TO anon, authenticated;
  END IF;
EXCEPTION
  WHEN undefined_table OR undefined_object THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Users create seller requests." ON public.seller_requests;
DROP POLICY IF EXISTS "Users view own seller requests." ON public.seller_requests;
DROP POLICY IF EXISTS "Admins view seller requests." ON public.seller_requests;
DROP POLICY IF EXISTS "Admins update seller requests." ON public.seller_requests;

CREATE POLICY "Visitors and users create seller requests." ON public.seller_requests
  FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND (
      (auth.uid() IS NULL AND user_id IS NULL)
      OR (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
      OR public.is_admin()
    )
  );

CREATE POLICY "Users view own seller requests." ON public.seller_requests
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

CREATE POLICY "Admins update seller requests." ON public.seller_requests
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
