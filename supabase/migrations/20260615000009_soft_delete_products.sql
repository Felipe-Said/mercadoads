ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS hidden_by_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_status_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_status_check
  CHECK (status IN ('draft', 'active', 'paused', 'rejected'));

CREATE INDEX IF NOT EXISTS products_hidden_status_idx
  ON public.products (hidden_by_admin, status, seller_id);
