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
  DROP POLICY IF EXISTS "Sellers manage own affiliates." ON public.affiliates;

  CREATE POLICY "Sellers manage own affiliates." ON public.affiliates
    FOR ALL USING (
      public.is_admin()
      OR (
        auth.uid() = seller_id
        AND EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE id = auth.uid()
            AND role = 'seller'
        )
      )
    )
    WITH CHECK (
      public.is_admin()
      OR (
        auth.uid() = seller_id
        AND EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE id = auth.uid()
            AND role = 'seller'
        )
      )
    );
END $$;
