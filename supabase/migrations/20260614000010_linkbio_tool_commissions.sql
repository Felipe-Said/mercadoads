ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS store_bio_tools_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS linkbio_referrer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS affiliate_source TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sales_affiliate_source_check'
      AND conrelid = 'public.sales'::regclass
  ) THEN
    ALTER TABLE public.sales
      ADD CONSTRAINT sales_affiliate_source_check
      CHECK (affiliate_source IS NULL OR affiliate_source IN ('product', 'linkbio'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS profiles_linkbio_referrer_idx
  ON public.profiles (linkbio_referrer_id);

CREATE INDEX IF NOT EXISTS sales_linkbio_affiliate_idx
  ON public.sales (affiliate_user_id, affiliate_source, created_at DESC)
  WHERE affiliate_source = 'linkbio';
