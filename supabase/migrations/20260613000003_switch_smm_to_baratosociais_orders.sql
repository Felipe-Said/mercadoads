ALTER TABLE public.smm_settings
  ALTER COLUMN api_base_url SET DEFAULT 'https://baratosociais.com/api/v2';

UPDATE public.smm_settings
SET api_base_url = 'https://baratosociais.com/api/v2',
    updated_at = NOW()
WHERE id = 1
  AND (
    api_base_url IS NULL
    OR api_base_url = ''
    OR api_base_url ILIKE '%mitik%'
  );

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS smm_service_id TEXT,
  ADD COLUMN IF NOT EXISTS smm_service_name TEXT,
  ADD COLUMN IF NOT EXISTS smm_service_type TEXT,
  ADD COLUMN IF NOT EXISTS smm_service_category TEXT,
  ADD COLUMN IF NOT EXISTS smm_link TEXT,
  ADD COLUMN IF NOT EXISTS smm_quantity INTEGER,
  ADD COLUMN IF NOT EXISTS smm_comments TEXT,
  ADD COLUMN IF NOT EXISTS smm_username TEXT,
  ADD COLUMN IF NOT EXISTS smm_answer_number TEXT;

CREATE TABLE IF NOT EXISTS public.smm_deliveries (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE UNIQUE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  provider_order_id TEXT,
  link TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  start_count TEXT,
  remains TEXT,
  charge TEXT,
  currency TEXT,
  provider_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS smm_deliveries_buyer_created_idx
  ON public.smm_deliveries (buyer_id, created_at DESC);

ALTER TABLE public.smm_deliveries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Buyers view own SMM deliveries." ON public.smm_deliveries;
  DROP POLICY IF EXISTS "Admins view SMM deliveries." ON public.smm_deliveries;

  CREATE POLICY "Buyers view own SMM deliveries." ON public.smm_deliveries
    FOR SELECT USING (buyer_id = auth.uid());

  CREATE POLICY "Admins view SMM deliveries." ON public.smm_deliveries
    FOR SELECT USING (public.is_admin());

  DROP POLICY IF EXISTS "Buyers create pending SMM sales." ON public.sales;

  CREATE POLICY "Buyers create pending SMM sales." ON public.sales
    FOR INSERT WITH CHECK (
      buyer_id = auth.uid()
      AND status = 'pending'
      AND product_id IS NULL
      AND seller_id IS NULL
      AND proxy_offer_id IS NULL
      AND virtual_number_service_id IS NULL
      AND temp_email_service_id IS NULL
      AND smm_service_id IS NOT NULL
      AND smm_link IS NOT NULL
      AND smm_quantity IS NOT NULL
      AND amount > 0
    );
END $$;

GRANT SELECT ON public.smm_deliveries TO authenticated;
