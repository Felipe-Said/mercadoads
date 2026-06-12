ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS proxy_country_code TEXT,
  ADD COLUMN IF NOT EXISTS proxy_country_name TEXT,
  ADD COLUMN IF NOT EXISTS proxy_endpoint TEXT,
  ADD COLUMN IF NOT EXISTS proxy_port TEXT;

UPDATE public.sales
SET proxy_country_code = COALESCE(proxy_country_code, 'global'),
    proxy_country_name = COALESCE(proxy_country_name, 'Global / aleatorio'),
    proxy_endpoint = COALESCE(proxy_endpoint, 'gate.decodo.com'),
    proxy_port = COALESCE(proxy_port, '7000')
WHERE proxy_offer_id IS NOT NULL;
