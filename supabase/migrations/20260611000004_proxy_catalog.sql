CREATE TABLE IF NOT EXISTS public.proxy_offers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Proxy premium',
  country TEXT NOT NULL DEFAULT 'Global',
  city TEXT,
  protocol TEXT NOT NULL DEFAULT 'HTTP(S) / SOCKS5',
  endpoint TEXT,
  port TEXT,
  price TEXT NOT NULL DEFAULT 'Sob consulta',
  traffic TEXT NOT NULL DEFAULT 'Conforme plano',
  stock TEXT NOT NULL DEFAULT 'Disponivel',
  status TEXT NOT NULL DEFAULT 'Disponivel',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS proxy_offers_active_sort_idx
  ON public.proxy_offers (is_active, sort_order, id);

ALTER TABLE public.proxy_offers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'proxy_offers'
      AND policyname = 'Admins manage proxy offers.'
  ) THEN
    CREATE POLICY "Admins manage proxy offers." ON public.proxy_offers
      FOR ALL USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.proxy_offers TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.proxy_offers_id_seq TO authenticated;

INSERT INTO public.proxy_offers (name, type, country, protocol, price, traffic, stock, status, sort_order, is_active)
VALUES
  ('Proxy premium 5GB', 'Pool premium', 'Global', 'HTTP(S) / SOCKS5', 'R$ 79,90', '5GB', 'Disponivel', 'Disponivel', 10, TRUE),
  ('Proxy premium 10GB', 'Pool premium', 'Global', 'HTTP(S) / SOCKS5', 'R$ 139,90', '10GB', 'Disponivel', 'Disponivel', 20, TRUE),
  ('Proxy premium 25GB', 'Pool premium', 'Global', 'HTTP(S) / SOCKS5', 'R$ 299,90', '25GB', 'Disponivel', 'Disponivel', 30, TRUE)
ON CONFLICT DO NOTHING;
