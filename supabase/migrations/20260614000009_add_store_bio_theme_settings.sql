ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS store_bio_theme_json JSONB DEFAULT '{}'::jsonb;
