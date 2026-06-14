ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS boosted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS products_boosted_active_idx
  ON public.products (is_boosted, boost_expires_at DESC, boosted_at DESC)
  WHERE is_boosted = true;
