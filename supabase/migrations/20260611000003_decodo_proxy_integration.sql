CREATE TABLE IF NOT EXISTS public.decodo_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  api_base_url TEXT NOT NULL DEFAULT 'https://scraper-api.decodo.com',
  products_path TEXT NOT NULL DEFAULT '/v2/scrape',
  api_key TEXT,
  username TEXT,
  password TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT decodo_settings_singleton CHECK (id = 1)
);

ALTER TABLE public.decodo_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'decodo_settings'
      AND policyname = 'Admins manage Decodo settings.'
  ) THEN
    CREATE POLICY "Admins manage Decodo settings." ON public.decodo_settings
      FOR ALL USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON public.decodo_settings TO authenticated;

INSERT INTO public.decodo_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
