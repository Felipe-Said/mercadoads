ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile_avatars', 'profile_avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/svg+xml'];

DROP POLICY IF EXISTS "Public profile avatars are viewable." ON storage.objects;
DROP POLICY IF EXISTS "Users upload own profile avatars." ON storage.objects;
DROP POLICY IF EXISTS "Users update own profile avatars." ON storage.objects;
DROP POLICY IF EXISTS "Users delete own profile avatars." ON storage.objects;

CREATE POLICY "Public profile avatars are viewable." ON storage.objects
  FOR SELECT USING (bucket_id = 'profile_avatars');

CREATE POLICY "Users upload own profile avatars." ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile_avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users update own profile avatars." ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile_avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profile_avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own profile avatars." ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile_avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
