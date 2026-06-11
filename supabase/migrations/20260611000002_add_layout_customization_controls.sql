ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS header_topbar_bg_color TEXT DEFAULT '#fff3c4',
  ADD COLUMN IF NOT EXISTS header_topbar_text_color TEXT DEFAULT '#1f2937',
  ADD COLUMN IF NOT EXISTS header_nav_bg_color TEXT DEFAULT '#ffe600',
  ADD COLUMN IF NOT EXISTS header_nav_text_color TEXT DEFAULT '#333333';

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('platform_assets', 'platform_assets', true, 10485760)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 10485760;

DROP POLICY IF EXISTS "Public platform assets are viewable." ON storage.objects;
DROP POLICY IF EXISTS "Admins upload platform assets." ON storage.objects;
DROP POLICY IF EXISTS "Admins update platform assets." ON storage.objects;
DROP POLICY IF EXISTS "Admins delete platform assets." ON storage.objects;

CREATE POLICY "Public platform assets are viewable." ON storage.objects
  FOR SELECT USING (bucket_id = 'platform_assets');

CREATE POLICY "Admins upload platform assets." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'platform_assets' AND public.is_admin());

CREATE POLICY "Admins update platform assets." ON storage.objects
  FOR UPDATE USING (bucket_id = 'platform_assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'platform_assets' AND public.is_admin());

CREATE POLICY "Admins delete platform assets." ON storage.objects
  FOR DELETE USING (bucket_id = 'platform_assets' AND public.is_admin());
