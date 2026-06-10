ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS claim_until TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS sales_paid_at_idx
  ON public.sales (paid_at);

CREATE INDEX IF NOT EXISTS sales_claim_until_idx
  ON public.sales (claim_until);
