CREATE OR REPLACE FUNCTION public.accept_affiliate_invite(target_affiliate_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_id BIGINT;
BEGIN
  IF auth.uid() IS NULL OR NULLIF(trim(target_affiliate_id), '') IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.affiliates
  SET status = 'active'
  WHERE id::text = trim(target_affiliate_id)
    AND user_id = auth.uid()
    AND status = 'pending'
  RETURNING id INTO updated_id;

  RETURN updated_id IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_affiliate_invite(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_affiliate_invite(TEXT) TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
