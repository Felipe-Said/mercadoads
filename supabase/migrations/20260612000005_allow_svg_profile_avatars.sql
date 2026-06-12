UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/svg+xml']
WHERE id = 'profile_avatars';
