DO $$
BEGIN
  DROP POLICY IF EXISTS "Buyers cancel own pending sales." ON public.sales;
  DROP POLICY IF EXISTS "Admins update sales." ON public.sales;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sales'
      AND policyname = 'Buyers cancel own pending sales.'
  ) THEN
    CREATE POLICY "Buyers cancel own pending sales." ON public.sales
      FOR UPDATE USING (
        auth.uid() = buyer_id
        AND status = 'pending'
      )
      WITH CHECK (
        auth.uid() = buyer_id
        AND status = 'cancelled'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sales'
      AND policyname = 'Admins update sales.'
  ) THEN
    CREATE POLICY "Admins update sales." ON public.sales
      FOR UPDATE USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;
