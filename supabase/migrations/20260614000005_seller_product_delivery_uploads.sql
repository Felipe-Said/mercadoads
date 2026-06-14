ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS credentials_data JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS seller_note TEXT,
  ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT 'ready' CHECK (delivery_method IN ('ready', 'dropservice'));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product_images', 'product_images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/svg+xml'];

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('product_files', 'product_files', false, 52428800)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 52428800;

DROP POLICY IF EXISTS "Public product images are viewable." ON storage.objects;
DROP POLICY IF EXISTS "Users upload own product images." ON storage.objects;
DROP POLICY IF EXISTS "Users update own product images." ON storage.objects;
DROP POLICY IF EXISTS "Users delete own product images." ON storage.objects;

CREATE POLICY "Public product images are viewable." ON storage.objects
  FOR SELECT USING (bucket_id = 'product_images');

CREATE POLICY "Users upload own product images." ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product_images'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

CREATE POLICY "Users update own product images." ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product_images'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  )
  WITH CHECK (
    bucket_id = 'product_images'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

CREATE POLICY "Users delete own product images." ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product_images'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

DROP POLICY IF EXISTS "Product files readable by signed URL." ON storage.objects;
DROP POLICY IF EXISTS "Users upload product files." ON storage.objects;
DROP POLICY IF EXISTS "Users update product files." ON storage.objects;
DROP POLICY IF EXISTS "Users delete product files." ON storage.objects;

CREATE POLICY "Product files readable by signed URL." ON storage.objects
  FOR SELECT USING (bucket_id = 'product_files' AND auth.role() = 'authenticated');

CREATE POLICY "Users upload product files." ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product_files'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

CREATE POLICY "Users update product files." ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product_files'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  )
  WITH CHECK (
    bucket_id = 'product_files'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

CREATE POLICY "Users delete product files." ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product_files'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
  );

CREATE OR REPLACE FUNCTION public.sale_release_interval(target_sale_id BIGINT)
RETURNS INTERVAL
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN COALESCE(products.delivery_method, 'ready') = 'dropservice' THEN interval '48 hours'
    ELSE interval '24 hours'
  END
  FROM public.sales
  LEFT JOIN public.products ON products.id = sales.product_id
  WHERE sales.id = target_sale_id;
$$;

CREATE OR REPLACE FUNCTION public.mark_sale_paid_from_wallet_spend()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.sales
     SET status = 'paid',
         payment_gateway = 'wallet',
         payment_external_ref = 'wallet-' || NEW.id::text,
         paid_at = now(),
         claim_until = now() + COALESCE(public.sale_release_interval(NEW.sale_id), interval '24 hours')
   WHERE id = NEW.sale_id;

  RETURN NEW;
END;
$$;
