ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS virtual_number_service_id TEXT,
  ADD COLUMN IF NOT EXISTS virtual_number_service_name TEXT,
  ADD COLUMN IF NOT EXISTS virtual_number_service_code TEXT,
  ADD COLUMN IF NOT EXISTS virtual_number_country_code TEXT,
  ADD COLUMN IF NOT EXISTS virtual_number_country_name TEXT,
  ADD COLUMN IF NOT EXISTS virtual_number_ddd TEXT,
  ADD COLUMN IF NOT EXISTS virtual_number_operator TEXT;

CREATE TABLE IF NOT EXISTS public.virtual_number_deliveries (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE UNIQUE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_activation_id TEXT,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_code TEXT,
  country_code TEXT,
  country_name TEXT,
  ddd TEXT,
  phone_number TEXT,
  sms_code TEXT,
  status TEXT NOT NULL DEFAULT 'waiting_sms',
  expires_at TIMESTAMPTZ,
  provider_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS virtual_number_deliveries_buyer_created_idx
  ON public.virtual_number_deliveries (buyer_id, created_at DESC);

ALTER TABLE public.virtual_number_deliveries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Buyers view own virtual number deliveries." ON public.virtual_number_deliveries;
  DROP POLICY IF EXISTS "Admins view virtual number deliveries." ON public.virtual_number_deliveries;

  CREATE POLICY "Buyers view own virtual number deliveries." ON public.virtual_number_deliveries
    FOR SELECT USING (buyer_id = auth.uid());

  CREATE POLICY "Admins view virtual number deliveries." ON public.virtual_number_deliveries
    FOR SELECT USING (public.is_admin());

  DROP POLICY IF EXISTS "Buyers create pending virtual number sales." ON public.sales;

  CREATE POLICY "Buyers create pending virtual number sales." ON public.sales
    FOR INSERT WITH CHECK (
      buyer_id = auth.uid()
      AND status = 'pending'
      AND product_id IS NULL
      AND seller_id IS NULL
      AND proxy_offer_id IS NULL
      AND virtual_number_service_id IS NOT NULL
      AND amount > 0
    );
END $$;

GRANT SELECT ON public.virtual_number_deliveries TO authenticated;
