ALTER TABLE public.affiliates
  ADD COLUMN IF NOT EXISTS product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS referral_ip TEXT,
  ADD COLUMN IF NOT EXISTS last_referral_ip TEXT;

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS affiliate_ref_product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS buyer_ip TEXT,
  ADD COLUMN IF NOT EXISTS affiliate_fraud_status TEXT NOT NULL DEFAULT 'clear',
  ADD COLUMN IF NOT EXISTS affiliate_fraud_reason TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS balance_frozen_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS balance_frozen_reason TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sales_affiliate_fraud_status_check'
      AND conrelid = 'public.sales'::regclass
  ) THEN
    ALTER TABLE public.sales
      ADD CONSTRAINT sales_affiliate_fraud_status_check
      CHECK (affiliate_fraud_status IN ('clear', 'suspected', 'blocked'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS affiliates_user_product_unique
  ON public.affiliates (user_id, product_id)
  WHERE product_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS affiliates_product_status_idx
  ON public.affiliates (product_id, status);

CREATE INDEX IF NOT EXISTS sales_affiliate_fraud_idx
  ON public.sales (affiliate_user_id, affiliate_fraud_status);

DROP POLICY IF EXISTS "Users join product affiliate programs." ON public.affiliates;
CREATE POLICY "Users join product affiliate programs." ON public.affiliates
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND product_id IS NOT NULL
    AND status = 'active'
    AND EXISTS (
      SELECT 1
      FROM public.products
      WHERE products.id = affiliates.product_id
        AND products.seller_id = affiliates.seller_id
        AND products.allow_affiliates = TRUE
        AND COALESCE(products.default_commission, 0) > 0
        AND products.status = 'active'
        AND COALESCE(products.hidden_by_admin, FALSE) = FALSE
        AND products.seller_id IS DISTINCT FROM auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.freeze_affiliate_balance(
  target_user_id UUID,
  freeze_reason TEXT DEFAULT 'affiliate_fraud'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    balance_frozen_until = GREATEST(
      COALESCE(balance_frozen_until, now()),
      now() + INTERVAL '160 days'
    ),
    balance_frozen_reason = freeze_reason,
    updated_at = now()
  WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_self_affiliate_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.affiliate_user_id IS NOT NULL
    AND NEW.buyer_id IS NOT NULL
    AND NEW.affiliate_user_id = NEW.buyer_id THEN
    PERFORM public.freeze_affiliate_balance(NEW.affiliate_user_id, 'self_affiliate_purchase');
    NEW.affiliate_fraud_status = 'blocked';
    NEW.affiliate_fraud_reason = 'self_affiliate_purchase';
    RAISE EXCEPTION 'Voce nao pode comprar usando seu proprio link de afiliado.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_affiliate_sale ON public.sales;
CREATE TRIGGER prevent_self_affiliate_sale
  BEFORE INSERT OR UPDATE OF affiliate_user_id, buyer_id
  ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_affiliate_sale();
