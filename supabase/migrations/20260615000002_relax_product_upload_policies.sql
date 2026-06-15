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
DROP POLICY IF EXISTS "Authenticated users upload product images." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update product images." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload product files." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update product files." ON storage.objects;

CREATE POLICY "Authenticated users upload product images." ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product_images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users update product images." ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product_images'
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'product_images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users upload product files." ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product_files'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users update product files." ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product_files'
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'product_files'
    AND auth.role() = 'authenticated'
  );
