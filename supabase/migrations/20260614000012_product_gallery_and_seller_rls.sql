ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_gallery_json JSONB DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.can_manage_product_owner(target_seller_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND COALESCE(status, 'active') = 'active'
      AND (
        role = 'admin'
        OR (role = 'seller' AND id = target_seller_id)
      )
  );
$$;

DROP POLICY IF EXISTS "Sellers insert own products." ON public.products;
DROP POLICY IF EXISTS "Sellers update own products." ON public.products;

CREATE POLICY "Sellers insert own products." ON public.products
  FOR INSERT
  WITH CHECK (public.can_manage_product_owner(seller_id));

CREATE POLICY "Sellers update own products." ON public.products
  FOR UPDATE
  USING (public.can_manage_product_owner(seller_id))
  WITH CHECK (public.can_manage_product_owner(seller_id));
