ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_gallery_json JSONB DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.can_manage_product_owner(target_seller_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND COALESCE(status, 'active') = 'active'
      AND (
        role = 'admin'
        OR (role = 'seller' AND id = target_seller_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_storage_owner(owner_folder TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND id::text = owner_folder
      AND role IN ('seller', 'admin')
      AND COALESCE(status, 'active') = 'active'
  )
  OR public.is_admin();
$$;

DROP POLICY IF EXISTS "Sellers insert own products." ON public.products;
DROP POLICY IF EXISTS "Sellers update own products." ON public.products;

CREATE POLICY "Sellers insert own products." ON public.products
  FOR INSERT
  WITH CHECK (public.can_manage_product_owner(seller_id));

CREATE POLICY "Sellers update own products." ON public.products
  FOR UPDATE
  USING (public.can_manage_product_owner(seller_id))
  WITH CHECK (public.can_manage_product_owner(seller_id));

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
      file_size_limit = 52428800,
      allowed_mime_types = NULL;

DROP POLICY IF EXISTS "Users upload own product images." ON storage.objects;
DROP POLICY IF EXISTS "Users update own product images." ON storage.objects;
DROP POLICY IF EXISTS "Users delete own product images." ON storage.objects;
DROP POLICY IF EXISTS "Users upload product files." ON storage.objects;
DROP POLICY IF EXISTS "Users update product files." ON storage.objects;
DROP POLICY IF EXISTS "Users delete product files." ON storage.objects;

CREATE POLICY "Users upload own product images." ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product_images'
    AND public.can_manage_storage_owner((storage.foldername(name))[1])
  );

CREATE POLICY "Users update own product images." ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product_images'
    AND public.can_manage_storage_owner((storage.foldername(name))[1])
  )
  WITH CHECK (
    bucket_id = 'product_images'
    AND public.can_manage_storage_owner((storage.foldername(name))[1])
  );

CREATE POLICY "Users delete own product images." ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product_images'
    AND public.can_manage_storage_owner((storage.foldername(name))[1])
  );

CREATE POLICY "Users upload product files." ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product_files'
    AND public.can_manage_storage_owner((storage.foldername(name))[1])
  );

CREATE POLICY "Users update product files." ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product_files'
    AND public.can_manage_storage_owner((storage.foldername(name))[1])
  )
  WITH CHECK (
    bucket_id = 'product_files'
    AND public.can_manage_storage_owner((storage.foldername(name))[1])
  );

CREATE POLICY "Users delete product files." ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product_files'
    AND public.can_manage_storage_owner((storage.foldername(name))[1])
  );
