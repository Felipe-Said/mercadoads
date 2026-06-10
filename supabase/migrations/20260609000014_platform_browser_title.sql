ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS browser_title TEXT;
