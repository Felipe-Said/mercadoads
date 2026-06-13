CREATE TABLE IF NOT EXISTS public.temp_email_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  api_base_url TEXT NOT NULL DEFAULT 'https://app.numero-virtual.com',
  api_key TEXT,
  default_markup_percent NUMERIC(10,2) NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT temp_email_settings_singleton CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS public.temp_email_service_overrides (
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

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS temp_email_service_id TEXT,
  ADD COLUMN IF NOT EXISTS temp_email_service_name TEXT,
  ADD COLUMN IF NOT EXISTS temp_email_service_code TEXT,
  ADD COLUMN IF NOT EXISTS temp_email_domain TEXT;

CREATE TABLE IF NOT EXISTS public.temp_email_deliveries (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE UNIQUE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_activation_id TEXT,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_code TEXT,
  domain TEXT,
  email TEXT,
  code TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  provider_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS temp_email_service_overrides_active_sort_idx
  ON public.temp_email_service_overrides (is_active, sort_order, id);

CREATE INDEX IF NOT EXISTS temp_email_deliveries_buyer_created_idx
  ON public.temp_email_deliveries (buyer_id, created_at DESC);

ALTER TABLE public.temp_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temp_email_service_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temp_email_deliveries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins manage temp email settings." ON public.temp_email_settings;
  DROP POLICY IF EXISTS "Admins manage temp email service overrides." ON public.temp_email_service_overrides;
  DROP POLICY IF EXISTS "Buyers view own temp email deliveries." ON public.temp_email_deliveries;
  DROP POLICY IF EXISTS "Admins view temp email deliveries." ON public.temp_email_deliveries;

  CREATE POLICY "Admins manage temp email settings." ON public.temp_email_settings
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

  CREATE POLICY "Admins manage temp email service overrides." ON public.temp_email_service_overrides
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());

  CREATE POLICY "Buyers view own temp email deliveries." ON public.temp_email_deliveries
    FOR SELECT USING (buyer_id = auth.uid());

  CREATE POLICY "Admins view temp email deliveries." ON public.temp_email_deliveries
    FOR SELECT USING (public.is_admin());

  DROP POLICY IF EXISTS "Buyers create pending temp email sales." ON public.sales;

  CREATE POLICY "Buyers create pending temp email sales." ON public.sales
    FOR INSERT WITH CHECK (
      buyer_id = auth.uid()
      AND status = 'pending'
      AND product_id IS NULL
      AND seller_id IS NULL
      AND proxy_offer_id IS NULL
      AND virtual_number_service_id IS NULL
      AND temp_email_service_id IS NOT NULL
      AND amount > 0
    );
END $$;

GRANT SELECT, INSERT, UPDATE ON public.temp_email_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.temp_email_service_overrides TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.temp_email_service_overrides_id_seq TO authenticated;
GRANT SELECT ON public.temp_email_deliveries TO authenticated;

INSERT INTO public.temp_email_settings (id, active)
VALUES (1, TRUE)
ON CONFLICT (id) DO NOTHING;
