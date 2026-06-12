ALTER TABLE public.product_reviews
  ADD COLUMN IF NOT EXISTS sale_id BIGINT REFERENCES public.sales(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS product_reviews_sale_id_unique
  ON public.product_reviews (sale_id)
  WHERE sale_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS product_reviews_product_created_idx
  ON public.product_reviews (product_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_product_review_from_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sale_row public.sales%ROWTYPE;
BEGIN
  IF NEW.sale_id IS NULL THEN
    RAISE EXCEPTION 'sale_id is required';
  END IF;

  SELECT *
    INTO sale_row
    FROM public.sales
   WHERE id = NEW.sale_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Compra nao encontrada';
  END IF;

  IF sale_row.buyer_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Voce so pode avaliar suas proprias compras';
  END IF;

  IF sale_row.status IS DISTINCT FROM 'paid' THEN
    RAISE EXCEPTION 'A compra precisa estar paga para avaliar';
  END IF;

  IF sale_row.product_id IS NULL THEN
    RAISE EXCEPTION 'Avaliacao disponivel apenas para produtos';
  END IF;

  IF sale_row.claim_until IS NULL OR sale_row.claim_until > now() THEN
    RAISE EXCEPTION 'A avaliacao libera apos o periodo de reclamacao';
  END IF;

  NEW.product_id := sale_row.product_id;
  NEW.user_id := sale_row.buyer_id;
  NEW.seller_id := sale_row.seller_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_product_review_from_sale ON public.product_reviews;
CREATE TRIGGER set_product_review_from_sale
  BEFORE INSERT OR UPDATE OF sale_id, product_id, user_id, seller_id
  ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_product_review_from_sale();

DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users create reviews." ON public.product_reviews;
  DROP POLICY IF EXISTS "Buyers review completed purchases." ON public.product_reviews;

  CREATE POLICY "Buyers review completed purchases." ON public.product_reviews
    FOR INSERT
    WITH CHECK (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1
          FROM public.sales
         WHERE sales.id = product_reviews.sale_id
           AND sales.buyer_id = auth.uid()
           AND sales.product_id = product_reviews.product_id
           AND sales.status = 'paid'
           AND sales.claim_until IS NOT NULL
           AND sales.claim_until <= now()
      )
    );
END $$;
