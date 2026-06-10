DO $$
BEGIN
  DROP POLICY IF EXISTS "Buyers delete own pending sales." ON public.sales;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sales'
      AND policyname = 'Buyers delete own pending sales.'
  ) THEN
    CREATE POLICY "Buyers delete own pending sales." ON public.sales
      FOR DELETE USING (
        auth.uid() = buyer_id
        AND status = 'pending'
      );
  END IF;
END $$;
