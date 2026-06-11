ALTER TABLE public.decodo_settings
  ALTER COLUMN api_base_url SET DEFAULT 'https://api.decodo.com/v2',
  ALTER COLUMN products_path SET DEFAULT '/subscriptions';

UPDATE public.decodo_settings
SET api_base_url = 'https://api.decodo.com/v2',
    products_path = '/subscriptions',
    updated_at = NOW()
WHERE id = 1
  AND (
    api_base_url IS NULL
    OR api_base_url ILIKE '%scraper-api%'
    OR products_path IS NULL
    OR products_path = '/v2/scrape'
  );

ALTER TABLE public.proxy_offers
  ADD COLUMN IF NOT EXISTS price_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS traffic_limit_gb NUMERIC(10,2) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS service_type TEXT NOT NULL DEFAULT 'residential_proxies',
  ADD COLUMN IF NOT EXISTS auto_disable BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE public.proxy_offers
SET price_amount = COALESCE(
      price_amount,
      NULLIF(
        replace(
          replace(
            regexp_replace(price, '[^0-9,\.]', '', 'g'),
            '.', ''
          ),
          ',', '.'
        ),
        ''
      )::NUMERIC
    ),
    traffic_limit_gb = COALESCE(
      NULLIF(regexp_replace(traffic, '[^0-9,\.]', '', 'g'), '')::NUMERIC,
      traffic_limit_gb,
      1
    )
WHERE price_amount IS NULL
   OR traffic_limit_gb IS NULL;

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS proxy_offer_id BIGINT REFERENCES public.proxy_offers(id);

CREATE TABLE IF NOT EXISTS public.proxy_deliveries (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE UNIQUE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proxy_offer_id BIGINT REFERENCES public.proxy_offers(id),
  provider_sub_user_id TEXT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  host TEXT NOT NULL DEFAULT 'gate.decodo.com',
  port TEXT NOT NULL DEFAULT '7000',
  service_type TEXT NOT NULL DEFAULT 'residential_proxies',
  traffic_limit_gb NUMERIC(10,2) NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  provider_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS proxy_deliveries_buyer_idx
  ON public.proxy_deliveries (buyer_id, created_at DESC);

ALTER TABLE public.proxy_deliveries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Buyers create pending proxy sales." ON public.sales;
  DROP POLICY IF EXISTS "Buyers view own proxy deliveries." ON public.proxy_deliveries;
  DROP POLICY IF EXISTS "Admins manage proxy deliveries." ON public.proxy_deliveries;

  CREATE POLICY "Buyers create pending proxy sales." ON public.sales
    FOR INSERT WITH CHECK (
      auth.uid() = buyer_id
      AND status = 'pending'
      AND product_id IS NULL
      AND proxy_offer_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.proxy_offers
        WHERE proxy_offers.id = sales.proxy_offer_id
          AND proxy_offers.is_active = TRUE
          AND proxy_offers.price_amount = sales.amount
      )
    );

  CREATE POLICY "Buyers view own proxy deliveries." ON public.proxy_deliveries
    FOR SELECT USING (auth.uid() = buyer_id);

  CREATE POLICY "Admins manage proxy deliveries." ON public.proxy_deliveries
    FOR ALL USING (public.is_admin())
    WITH CHECK (public.is_admin());
END $$;

GRANT SELECT ON public.proxy_deliveries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proxy_deliveries TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.proxy_deliveries_id_seq TO authenticated;
