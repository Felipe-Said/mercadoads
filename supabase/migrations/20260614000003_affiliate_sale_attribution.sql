ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS affiliate_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS affiliate_commission_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS affiliate_commission_amount NUMERIC(12,2);

CREATE INDEX IF NOT EXISTS sales_seller_affiliate_created_idx
  ON public.sales (seller_id, affiliate_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS sales_affiliate_created_idx
  ON public.sales (affiliate_user_id, created_at DESC);
