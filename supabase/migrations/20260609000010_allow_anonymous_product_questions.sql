ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public questions are viewable." ON public.product_questions;
DROP POLICY IF EXISTS "Authenticated users ask questions." ON public.product_questions;
DROP POLICY IF EXISTS "Sellers and admins answer questions." ON public.product_questions;

CREATE POLICY "Public questions are viewable." ON public.product_questions
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users ask questions." ON public.product_questions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION public.set_product_question_user_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_product_question_user_id ON public.product_questions;
CREATE TRIGGER set_product_question_user_id
  BEFORE INSERT ON public.product_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_product_question_user_id();

CREATE POLICY "Sellers and admins answer questions." ON public.product_questions
  FOR UPDATE
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.products
      WHERE products.id = product_questions.product_id
        AND products.seller_id = auth.uid()
    )
  );
