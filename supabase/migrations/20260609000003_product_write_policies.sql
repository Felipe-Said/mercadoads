DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Sellers insert own products.') THEN
    CREATE POLICY "Sellers insert own products." ON public.products
      FOR INSERT WITH CHECK (auth.uid() = seller_id OR public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'products' AND policyname = 'Sellers update own products.') THEN
    CREATE POLICY "Sellers update own products." ON public.products
      FOR UPDATE USING (auth.uid() = seller_id OR public.is_admin())
      WITH CHECK (auth.uid() = seller_id OR public.is_admin());
  END IF;
END $$;
