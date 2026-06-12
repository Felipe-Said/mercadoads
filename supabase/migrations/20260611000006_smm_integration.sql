CREATE TABLE IF NOT EXISTS public.smm_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  api_base_url TEXT NOT NULL DEFAULT 'https://baratosociais.com/api/v2',
  api_key TEXT,
  default_markup_percent NUMERIC(10,2) NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT smm_settings_singleton CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS public.smm_service_overrides (
  id BIGSERIAL PRIMARY KEY,
  service_id TEXT NOT NULL UNIQUE,
  custom_name TEXT,
  custom_category TEXT,
  price_per_1000 NUMERIC(12,4),
  markup_percent NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS smm_service_overrides_active_sort_idx
  ON public.smm_service_overrides (is_active, sort_order, id);

ALTER TABLE public.smm_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smm_service_overrides ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins manage SMM settings." ON public.smm_settings;
  DROP POLICY IF EXISTS "Admins manage SMM service overrides." ON public.smm_service_overrides;

  CREATE POLICY "Admins manage SMM settings." ON public.smm_settings
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

  CREATE POLICY "Admins manage SMM service overrides." ON public.smm_service_overrides
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());
END $$;

GRANT SELECT, INSERT, UPDATE ON public.smm_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smm_service_overrides TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.smm_service_overrides_id_seq TO authenticated;

INSERT INTO public.smm_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
