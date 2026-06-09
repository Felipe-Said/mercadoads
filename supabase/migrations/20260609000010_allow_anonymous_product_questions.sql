DROP POLICY IF EXISTS "Authenticated users ask questions." ON public.product_questions;
DROP POLICY IF EXISTS "Visitors and users ask questions." ON public.product_questions;

CREATE POLICY "Authenticated users ask questions." ON public.product_questions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
