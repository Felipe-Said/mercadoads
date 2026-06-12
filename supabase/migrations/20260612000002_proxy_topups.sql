ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS proxy_delivery_id BIGINT REFERENCES public.proxy_deliveries(id),
  ADD COLUMN IF NOT EXISTS proxy_topup_gb NUMERIC(10,2);

DO $$
BEGIN
  DROP POLICY IF EXISTS "Buyers create pending proxy sales." ON public.sales;

  CREATE POLICY "Buyers create pending proxy sales." ON public.sales
    FOR INSERT WITH CHECK (
      auth.uid() = buyer_id
      AND status = 'pending'
      AND product_id IS NULL
      AND proxy_offer_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.proxy_offers
        WHERE proxy_offers.id = sales.proxy_offer_id
          AND proxy_offers.is_active = TRUE
          AND proxy_offers.price_amount = sales.amount
      )
      AND (
        proxy_delivery_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.proxy_deliveries
          WHERE proxy_deliveries.id = sales.proxy_delivery_id
            AND proxy_deliveries.buyer_id = auth.uid()
            AND proxy_deliveries.status = 'active'
        )
      )
    );
END $$;
