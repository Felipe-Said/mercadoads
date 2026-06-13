CREATE TABLE IF NOT EXISTS public.virtual_number_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  api_base_url TEXT NOT NULL DEFAULT 'https://app.numero-virtual.com',
  api_key TEXT,
  auth_mode TEXT NOT NULL DEFAULT 'bearer' CHECK (auth_mode IN ('bearer', 'x-api-key', 'query_key', 'form_key')),
  balance_path TEXT NOT NULL DEFAULT '/api/balance',
  services_path TEXT NOT NULL DEFAULT '/api/services',
  countries_path TEXT NOT NULL DEFAULT '/api/countries',
  order_path TEXT NOT NULL DEFAULT '/api/order',
  default_markup_percent NUMERIC(10,2) NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT virtual_number_settings_singleton CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS public.virtual_number_service_overrides (
  id BIGSERIAL PRIMARY KEY,
  service_id TEXT NOT NULL UNIQUE,
  custom_name TEXT,
  custom_category TEXT,
  price_amount NUMERIC(12,4),
  markup_percent NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS virtual_number_service_overrides_active_sort_idx
  ON public.virtual_number_service_overrides (is_active, sort_order, id);

ALTER TABLE public.virtual_number_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_number_service_overrides ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins manage virtual number settings." ON public.virtual_number_settings;
  DROP POLICY IF EXISTS "Admins manage virtual number service overrides." ON public.virtual_number_service_overrides;

  CREATE POLICY "Admins manage virtual number settings." ON public.virtual_number_settings
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

  CREATE POLICY "Admins manage virtual number service overrides." ON public.virtual_number_service_overrides
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());
END $$;

GRANT SELECT, INSERT, UPDATE ON public.virtual_number_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.virtual_number_service_overrides TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.virtual_number_service_overrides_id_seq TO authenticated;

INSERT INTO public.virtual_number_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
