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
  DROP POLICY IF EXISTS "Sellers insert own products." ON public.products;
  DROP POLICY IF EXISTS "Sellers update own products." ON public.products;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Sellers insert own products.') THEN
    CREATE POLICY "Sellers insert own products." ON public.products
      FOR INSERT WITH CHECK (
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
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Sellers update own products.') THEN
    CREATE POLICY "Sellers update own products." ON public.products
      FOR UPDATE USING (
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
  END IF;
END $$;
